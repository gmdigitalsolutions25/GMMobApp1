/**
 * Qaraj GM — SMS Provider (Softline)
 *
 * Sends SMS via Soft-line.az HTTP API.
 * Configuration via .env:
 *   SMS_PROVIDER=softline          (or "mock" for dev mode)
 *   SMS_USER=diamondapi
 *   SMS_PASSWORD=u6s0Wo52
 *   SMS_SENDER=TOYOTA              (change to "Qaraj" when registered)
 *   SMS_BASE_URL=https://gw.soft-line.az
 *
 * API format:
 *   GET https://gw.soft-line.az/sendsms?user={user}&password={pass}&gsm={number}&from={sender}&text={message}
 *
 * Response: errno=100&errtext=OK&message_id=526973&charge=1&balance=123
 * errno=100 means success. See softline-api-notes.txt for full error codes.
 *
 * NOTE: gsm parameter takes 9-digit number WITHOUT +994 prefix.
 */

interface SmsResult {
  success: boolean;
  messageId?: string;
  balance?: string;
  error?: string;
  errno?: string;
}

const SOFTLINE_ERRORS: Record<string, string> = {
  '0': 'Missing parameter/xml parse error',
  '10': 'Configuration error',
  '20': 'Invalid msisdn/no valid message to send',
  '25': 'Blacklisted msisdn',
  '30': 'Unauthorized destination network',
  '40': 'Invalid username/password',
  '50': 'Unauthorized sender name',
  '60': 'Insufficient balance',
  '80': 'Invalid validity period',
  '85': 'Invalid delivery datetime',
  '90': 'Exceeded message size limit',
  '100': 'OK',
  '200': 'Server error',
};

/**
 * Send SMS via Softline HTTP API.
 * @param phone - 9-digit phone number (already normalized, no +994 prefix)
 * @param message - SMS text content
 */
async function sendViaSoftline(phone: string, message: string): Promise<SmsResult> {
  const user = process.env.SMS_USER || 'diamondapi';
  const password = process.env.SMS_PASSWORD || 'u6s0Wo52';
  const sender = process.env.SMS_SENDER || 'TOYOTA';
  const baseUrl = process.env.SMS_BASE_URL || 'https://gw.soft-line.az';

  // Build URL with query params
  const url = new URL('/sendsms', baseUrl);
  url.searchParams.set('user', user);
  url.searchParams.set('password', password);
  url.searchParams.set('gsm', phone);
  url.searchParams.set('from', sender);
  url.searchParams.set('text', message);

  console.log(`[SMS] Sending to ${phone} via Softline (sender: ${sender})`);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      signal: AbortSignal.timeout(15000), // 15s timeout
    });

    const body = await response.text();
    console.log(`[SMS] Softline response: ${body}`);

    // Parse response: errno=100&errtext=OK&message_id=526973&charge=1&balance=123
    const params = new URLSearchParams(body);
    const errno = params.get('errno') || '';
    const errtext = params.get('errtext') || '';
    const messageId = params.get('message_id') || '';
    const balance = params.get('balance') || '';

    if (errno === '100') {
      console.log(`[SMS] Delivered! message_id=${messageId}, balance=${balance}`);
      return {
        success: true,
        messageId,
        balance,
      };
    } else {
      const errorDesc = SOFTLINE_ERRORS[errno] || errtext || 'Unknown error';
      console.error(`[SMS] Failed! errno=${errno}: ${errorDesc}`);
      return {
        success: false,
        errno,
        error: errorDesc,
      };
    }
  } catch (err: any) {
    console.error(`[SMS] Network error: ${err.message}`);
    return {
      success: false,
      error: `Network error: ${err.message}`,
    };
  }
}

/**
 * Send OTP SMS. Uses Softline when SMS_PROVIDER=softline, otherwise mock mode.
 * @param phone - 9-digit normalized phone number
 * @param code - OTP code string
 */
export async function sendOtpSms(phone: string, code: string): Promise<SmsResult> {
  const provider = process.env.SMS_PROVIDER || 'mock';

  // OTP message text — keep it short and clear
  const message = `Qaraj GM: Your verification code is ${code}. Valid for 5 minutes.`;

  if (provider === 'softline') {
    return sendViaSoftline(phone, message);
  }

  // Mock mode — log to console
  console.log(`[SMS-MOCK] Phone: ${phone} | Code: ${code}`);
  return { success: true, messageId: 'mock-' + Date.now() };
}

/**
 * Check SMS delivery status via Softline API.
 * @param messageId - The message_id returned from sendViaSoftline
 */
export async function checkSmsStatus(messageId: string): Promise<{ status: string; date?: string }> {
  const user = process.env.SMS_USER || 'diamondapi';
  const password = process.env.SMS_PASSWORD || 'u6s0Wo52';
  const baseUrl = process.env.SMS_BASE_URL || 'https://gw.soft-line.az';

  const url = `${baseUrl}/query/single?username=${user}&apikey=${password}&messageid=${messageId}`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const body = await response.text();
    console.log(`[SMS] Status check for ${messageId}: ${body}`);

    // Parse: msisdn=994501234567&status=2&date=2015-01-08T11:53:31
    const params = new URLSearchParams(body);
    const status = params.get('status') || 'unknown';
    const date = params.get('date') || undefined;

    const statusMap: Record<string, string> = {
      '0': 'pending',
      '1': 'enroute',
      '2': 'delivered',
      '3': 'expired',
      '5': 'undeliverable',
      '8': 'rejected',
      '9': 'expired_local',
    };

    return { status: statusMap[status] || status, date };
  } catch (err: any) {
    return { status: `error: ${err.message}` };
  }
}
