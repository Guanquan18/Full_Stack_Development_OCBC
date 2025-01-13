/*--------------------- Start Below Here ---------------------*/

IF NOT EXISTS (SELECT name FROM master.dbo.sysdatabases WHERE name = 'OCBC_DB')
BEGIN
    CREATE DATABASE OCBC_DB;
    PRINT 'Database OCBC_DB created successfully.';
END
ELSE
BEGIN
    PRINT 'Database OCBC_DB already exists.';
    USE OCBC_DB;
    IF OBJECT_ID('Recipient', 'U') IS NOT NULL DROP TABLE Recipient;
    IF OBJECT_ID('BankTransaction', 'U') IS NOT NULL DROP TABLE BankTransaction;
    IF OBJECT_ID('Card', 'U') IS NOT NULL DROP TABLE Card;
    IF OBJECT_ID('Account', 'U') IS NOT NULL DROP TABLE Account;
    IF OBJECT_ID('Profile', 'U') IS NOT NULL DROP TABLE Profile;
    PRINT 'Existing tables dropped successfully.';
END
GO

/*--------------------- Don't touch anything above ---------------------*/

/*--------------------- If you need to reset database, just run the whole file. :) ---------------------*/

use OCBC_DB
go


--Profile Table
create table Profile
(
	ProfileId	smallint identity(1,1)	not null,
	FullName	varchar(25)				not null,
	AccessCode	char(7)					not null unique,
	PinHash		varchar(100)			not null,
	constraint PK_Profile primary key (ProfileId)
)

--Account Table
create table Account
(
	AccNum		varchar(20)		not null,
	AccType     varchar(30)     not null,
	Balance		float			not null,
	ProfileId	smallint		not null,
	constraint PK_Account primary key (AccNum),
	constraint FK_Account_ProfileId foreign key (ProfileId)
		references Profile (ProfileId)
)


--Card Table
create table Card
(
	CardNum			char(19)	not null,
	CardName		varchar(25)	not null,
	CardType		varchar(10) not null,
	DateOfExpiry	date		not null,
	CVV				char(3)		not null,
	AccNum			varchar(20)	not null,
	constraint PK_Card primary key (CardNum),
	constraint FK_Card_AccNum foreign key (AccNum)
		references Account (AccNum)
);

--Transaction Table
create table BankTransaction
(
	TransactNo		int	identity(1,1)	not null,
	TransactDate	date				not null,
	TransactAmount	float				not null,
	AccSender		varchar(20)			not null,
	AccReceiver		varchar(20)			not null,
	constraint PK_BankTransaction primary key (TransactNo),
	constraint FK_BankTransaction_AccSender foreign key (AccSender)
		references Account (AccNum),
	constraint FK_BankTransaction_AccReceiver foreign key (AccReceiver)
		references Account (AccNum)
)
--Recipient Table
create table Recipient (
    RecipientId     smallint identity(1,1) not null,
    RecipientName   varchar(25)            not null,
    BankName        varchar(50)            not null,
    AccNum          varchar(20)            not null,
    ProfileId       smallint               not null,
    constraint PK_Recipient primary key (RecipientId),
    constraint FK_Recipient_ProfileId foreign key (ProfileId)
        references Profile (ProfileId)
)
--Billing Table
CREATE TABLE Biller (
    BillerID       INT           IDENTITY(1,1) NOT NULL,
    BillerName     VARCHAR(50)   NOT NULL,
    BillerAccNum   VARCHAR(20)   NOT NULL,
    BankName       VARCHAR(50)   NOT NULL,
    Category       VARCHAR(30)   NOT NULL,  -- e.g., 'Utilities', 'Telecom', 'Insurance'
    CreatedDate    DATETIME      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Biller PRIMARY KEY (BillerID)
);

-- Bills Table
CREATE TABLE Bills (
    BillID         INT           IDENTITY(1,1) NOT NULL,
    BillerID       INT           NOT NULL,              
    ProfileID      SMALLINT      NOT NULL,              
    BillAmount     FLOAT         NOT NULL,              
    DueDate        DATETIME      NOT NULL,              
    Status         VARCHAR(20)   NOT NULL DEFAULT 'Unpaid', -- e.g., 'Unpaid', 'Paid', 'Overdue'
    CreatedDate    DATETIME      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Bills PRIMARY KEY (BillID),
    CONSTRAINT FK_Bills_BillerID FOREIGN KEY (BillerID) REFERENCES Biller (BillerID),
    CONSTRAINT FK_Bills_ProfileID FOREIGN KEY (ProfileID) REFERENCES Profile (ProfileID)
);




--Insert sample values
insert into Profile(FullName, AccessCode, PinHash)
values
('Ben Johnson', '1234567', '$2b$12$XotDxm0656ovIqS/GM6kE.doLo4TKqyvhM21A6ST1KtAswPi5GAXS'),
('Alice Johnson', '2345678', '$2b$12$z4rIi8CITVlHuBsq4miP5.8BEbmFMiO1bXmBRlBVhI0s29Cs8afl2'),
('Bob Smith', '3456789', '$2b$12$rLnEueQZq0iRHVKUZDy7vutrjOmBGKau/uLfo.xnMTHWza13iVr0S'),
('Carol Lee', '4567890', '$2b$12$bcV72RGe07uEYQjUFGxrieUFDs5RCl.d3yCJD9adyK0QorwDKmiIW'),
('David Brown', '5678901', '$2b$12$eJmaZ7edAQ21wCHD1JGis.j.iH2dRIW/VCEPYKPVVhVnhINCd7z7W')

insert into Account(AccNum, AccType, Balance, ProfileId)
values
('123-456789-001', 'Statement Savings Account', 1000.00, 1),
('234-567890-002', 'Statement Savings Account', 2500.75, 2),
('345-678901-003', 'Current Account', 5000.50, 3),
('456-789012-004', 'Statement Savings Account', 1500.20, 4),
('567-890123-005', 'Current Account', 1000.00, 5);

insert into Card (CardNum, CardName, CardType, DateOfExpiry, CVV, AccNum)	
values
('1234 5678 9012 3456', 'Guan Quan', 'Debit', '2025-12-31', '123', '123-456789-001'),
('2345 6789 0123 4567', 'Bob Smith', 'Debit','2026-11-30', '456', '234-567890-002'),
('3456 7890 1234 5678', 'Carol Lee', 'Debit','2025-08-31', '789', '345-678901-003'),
('4567 8901 2345 6789', 'David Brown', 'Debit','2025-05-31', '012', '456-789012-004'),
('5678 9012 3456 7890', 'Eve Williams', 'Debit','2027-04-30', '345', '567-890123-005');

INSERT INTO Biller (BillerName, BillerAccNum, BankName, Category)
VALUES 
('SP Services', '123-456789-ABC', 'Overseas-Chinese Bank (OCBC)', 'Utilities'),
('StarHub Telecom', '111-222333-XYZ', 'Overseas-Chinese Bank (OCBC)', 'Telecom');

INSERT INTO Bills (BillerID, ProfileID, BillAmount, DueDate)
VALUES 
(1, 1, 120.50, '2025-01-15'),
(2, 1, 89.90, '2025-03-10');

insert into BankTransaction(TransactDate, TransactAmount, AccSender, AccReceiver)
values
('2024-10-01', 100.50, '234-567890-002','123-456789-001'),
('2024-10-02', 250.00, '234-567890-002', '345-678901-003'),
('2024-10-03', 75.25, '345-678901-003', '123-456789-001'),
('2024-10-04', 150.00, '456-789012-004', '567-890123-005'),
('2024-10-05', 300.00, '123-456789-001', '456-789012-004');

insert into Recipient (RecipientName, BankName, AccNum, ProfileId)
values
-- Recipients for ProfileId 1 (Ben Johnson)
('Alice Johnson', 'Overseas-Chinese Bank (OCBC)', '234-567890-002', 1),
('Bob Smith', 'United Overseas Bank (UOB)', '345-678901-003', 1),
('Carol Lee', 'Development Bank of Singapore (DBS)', '456-789012-004', 1),

-- Recipients for ProfileId 2 (Alice Johnson)
('Ben Johnson', 'Overseas-Chinese Bank (OCBC)', '123-456789-001', 2),
('David Brown', 'Standard Chartered Bank', '567-890123-005', 2),
('Carol Lee', 'Development Bank of Singapore (DBS)', '456-789012-004', 2),

-- Recipients for ProfileId 3 (Bob Smith)
('Alice Johnson', 'Overseas-Chinese Bank (OCBC)', '234-567890-002', 3),
('Ben Johnson', 'Overseas-Chinese Bank (OCBC)', '123-456789-001', 3),
('David Brown', 'Standard Chartered Bank', '567-890123-005', 3),

-- Recipients for ProfileId 4 (Carol Lee)
('Bob Smith', 'United Overseas Bank (UOB)', '345-678901-003', 4),
('Alice Johnson', 'Overseas-Chinese Bank (OCBC)', '234-567890-002', 4),
('Ben Johnson', 'Overseas-Chinese Bank (OCBC)', '123-456789-001', 4),

-- Recipients for ProfileId 5 (David Brown)
('Carol Lee', 'Development Bank of Singapore (DBS)', '456-789012-004', 5),
('Alice Johnson', 'Overseas-Chinese Bank (OCBC)', '234-567890-002', 5),
('Bob Smith', 'United Overseas Bank (UOB)', '345-678901-003', 5);

