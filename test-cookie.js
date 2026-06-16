// Simple test to debug cookie issues
document.cookie = 'test1=value1; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/; SameSite=Strict';
document.cookie = 'test2=value2; path=/; SameSite=Strict';

console.log('Current cookies:', document.cookie);

// Check if admin cookie is set
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
};

console.log('Test1:', getCookie('test1'));
console.log('Test2:', getCookie('test2'));

// Test cookie creation
const setCookie = (name, value, days) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  const cookieString = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
  document.cookie = cookieString;
  console.log('Set cookie:', cookieString);
  console.log('Document cookies:', document.cookie);
};

setCookie('admin', 'true', 7);
console.log('Admin cookie:', getCookie('admin'));
