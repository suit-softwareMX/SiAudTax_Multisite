export const EMAIL_NAME_MAX = 150;
export const ALTERNATE_EMAIL_MAX = 254;

const namePattern = /^\p{Script=Latin}[\p{Script=Latin}\p{M}]*(?:(?:[ .'’\p{Pd}]|\. )\p{Script=Latin}[\p{Script=Latin}\p{M}]*)*\.?$/u;
const localPartPattern = /^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*$/;
const domainPattern = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,63}|xn--[a-z0-9-]{1,58}[a-z0-9])$/;

export function emailNameToLocalPart(name) {
  return name.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "");
}

export function validateEmailAccount(name, email) {
  const userName = typeof name === "string" ? name.trim().replace(/ +/g, " ") : "";
  const alternateEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const errors = {};
  if (userName.length > EMAIL_NAME_MAX || !namePattern.test(userName) || !/[a-z]/.test(emailNameToLocalPart(userName))) {
    errors.userName = `Escribe un nombre de hasta ${EMAIL_NAME_MAX} caracteres con letras del alfabeto latino, espacios, puntos, apóstrofos o guiones.`;
  }

  const [local, domain, extra] = alternateEmail.split("@");
  if (alternateEmail.length > ALTERNATE_EMAIL_MAX || local.length > 64 || extra !== undefined ||
      !localPartPattern.test(local) || !domain || !domainPattern.test(domain)) {
    errors.alternateEmail = "Escribe un correo alterno válido, por ejemplo usuario@ejemplo.com.";
  }
  return { userName, alternateEmail, errors };
}
