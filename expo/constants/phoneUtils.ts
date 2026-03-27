export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('994')) {
    const withoutCode = cleaned.slice(3);
    
    if (withoutCode.length === 0) {
      return '+994';
    } else if (withoutCode.length <= 2) {
      return `+994-${withoutCode}`;
    } else if (withoutCode.length <= 5) {
      return `+994-${withoutCode.slice(0, 2)}-${withoutCode.slice(2)}`;
    } else if (withoutCode.length <= 7) {
      return `+994-${withoutCode.slice(0, 2)}-${withoutCode.slice(2, 5)}-${withoutCode.slice(5)}`;
    } else {
      return `+994-${withoutCode.slice(0, 2)}-${withoutCode.slice(2, 5)}-${withoutCode.slice(5, 7)}-${withoutCode.slice(7, 9)}`;
    }
  }
  
  if (cleaned.length === 0) {
    return '';
  } else if (cleaned.length <= 3) {
    return `+${cleaned}`;
  } else if (cleaned.length <= 5) {
    return `+${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  } else if (cleaned.length <= 8) {
    return `+${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
  } else if (cleaned.length <= 10) {
    return `+${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 8)}-${cleaned.slice(8)}`;
  } else {
    return `+${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 8)}-${cleaned.slice(8, 10)}-${cleaned.slice(10, 12)}`;
  }
};

export const unformatPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

export const PHONE_PLACEHOLDER = '+994-XX-XXX-XX-XX';
