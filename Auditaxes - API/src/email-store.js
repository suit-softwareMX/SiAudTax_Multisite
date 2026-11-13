import sql from "mssql/msnodesqlv8.js";
import { config } from "./config.js";

let poolPromise;

function pool() {
  poolPromise ||= sql.connect(config.database).catch(error => {
    poolPromise = null;
    throw error;
  });
  return poolPromise;
}

export async function databaseHealth() {
  const result = await (await pool()).request().query("SELECT DB_NAME() AS databaseName, @@SERVERNAME AS serverName");
  return result.recordset[0];
}

export async function listEmailAccounts(countryCode) {
  const result = await (await pool()).request()
    .input("countryCode", sql.NVarChar(30), countryCode)
    .query(`SELECT Id AS id, CountryCode AS countryCode, UserName AS userName,
      EmailAddress AS emailAddress, AlternateEmail AS alternateEmail, CreatedAt AS createdAt
      FROM dbo.EmailAccounts WHERE CountryCode = @countryCode AND IsActive = 1
      ORDER BY CreatedAt DESC`);
  return result.recordset;
}

function localPart(name) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "").slice(0, 64);
}

const domains = { global: "auditaxes.com", mexico: "mexico.auditaxes.com", salvador: "elsalvador.auditaxes.com" };

export async function createEmailAccount(countryCode, userName, alternateEmail, createdBy) {
  const base = localPart(userName);
  if (!base) throw Object.assign(new Error("El nombre no permite generar una dirección de correo"), { status: 400 });
  const connection = await pool();
  const domain = domains[countryCode] || `${countryCode}.auditaxes.com`;
  for (let suffix = 0; suffix < 100; suffix += 1) {
    const emailAddress = `${base}${suffix ? `.${suffix + 1}` : ""}@${domain}`;
    try {
      const result = await connection.request()
        .input("countryCode", sql.NVarChar(30), countryCode)
        .input("userName", sql.NVarChar(150), userName)
        .input("emailAddress", sql.NVarChar(254), emailAddress)
        .input("alternateEmail", sql.NVarChar(254), alternateEmail)
        .input("createdBy", sql.NVarChar(100), createdBy)
        .query(`INSERT INTO dbo.EmailAccounts (CountryCode, UserName, EmailAddress, AlternateEmail, CreatedBy)
          OUTPUT inserted.Id AS id, inserted.CountryCode AS countryCode, inserted.UserName AS userName,
          inserted.EmailAddress AS emailAddress, inserted.AlternateEmail AS alternateEmail, inserted.CreatedAt AS createdAt
          VALUES (@countryCode, @userName, @emailAddress, @alternateEmail, @createdBy)`);
      return result.recordset[0];
    } catch (error) {
      if (![2601, 2627].includes(error.number)) throw error;
    }
  }
  throw Object.assign(new Error("No se pudo generar una dirección disponible"), { status: 409 });
}

export async function deactivateEmailAccount(countryCode, id, deactivatedBy) {
  const result = await (await pool()).request()
    .input("id", sql.UniqueIdentifier, id)
    .input("countryCode", sql.NVarChar(30), countryCode)
    .input("deactivatedBy", sql.NVarChar(100), deactivatedBy)
    .query(`UPDATE dbo.EmailAccounts SET IsActive = 0, DeactivatedAt = SYSUTCDATETIME(), DeactivatedBy = @deactivatedBy
      WHERE Id = @id AND CountryCode = @countryCode AND IsActive = 1`);
  return result.rowsAffected[0] === 1;
}

export async function requestPasswordRecovery(countryCode, id, requestedBy) {
  const result = await (await pool()).request()
    .input("id", sql.UniqueIdentifier, id)
    .input("countryCode", sql.NVarChar(30), countryCode)
    .input("requestedBy", sql.NVarChar(100), requestedBy)
    .query(`INSERT INTO dbo.PasswordRecoveryRequests (EmailAccountId, RequestedBy)
      OUTPUT inserted.Id AS requestId, inserted.RequestedAt AS requestedAt
      SELECT Id, @requestedBy FROM dbo.EmailAccounts
      WHERE Id = @id AND CountryCode = @countryCode AND IsActive = 1`);
  return result.recordset[0] || null;
}

export async function closeDatabase() {
  if (poolPromise) await sql.close();
  poolPromise = null;
}
