USE [master];
GO

IF DB_ID(N'Auditaxes') IS NULL
  CREATE DATABASE [Auditaxes];
GO

USE [Auditaxes];
GO

IF OBJECT_ID(N'dbo.EmailAccounts', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.EmailAccounts (
    Id uniqueidentifier NOT NULL CONSTRAINT PK_EmailAccounts PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    CountryCode nvarchar(30) NOT NULL,
    UserName nvarchar(150) NOT NULL,
    EmailAddress nvarchar(254) NOT NULL,
    AlternateEmail nvarchar(254) NOT NULL,
    IsActive bit NOT NULL CONSTRAINT DF_EmailAccounts_IsActive DEFAULT (1),
    CreatedAt datetime2(0) NOT NULL CONSTRAINT DF_EmailAccounts_CreatedAt DEFAULT SYSUTCDATETIME(),
    CreatedBy nvarchar(100) NOT NULL,
    DeactivatedAt datetime2(0) NULL,
    DeactivatedBy nvarchar(100) NULL,
    CONSTRAINT UQ_EmailAccounts_EmailAddress UNIQUE (EmailAddress)
  );
  CREATE INDEX IX_EmailAccounts_CountryCode_IsActive
    ON dbo.EmailAccounts (CountryCode, IsActive, CreatedAt DESC);
END;
GO

IF OBJECT_ID(N'dbo.PasswordRecoveryRequests', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.PasswordRecoveryRequests (
    Id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_PasswordRecoveryRequests PRIMARY KEY,
    EmailAccountId uniqueidentifier NOT NULL,
    RequestedAt datetime2(0) NOT NULL CONSTRAINT DF_PasswordRecoveryRequests_RequestedAt DEFAULT SYSUTCDATETIME(),
    RequestedBy nvarchar(100) NOT NULL,
    CONSTRAINT FK_PasswordRecoveryRequests_EmailAccounts FOREIGN KEY (EmailAccountId)
      REFERENCES dbo.EmailAccounts (Id)
  );
END;
GO

