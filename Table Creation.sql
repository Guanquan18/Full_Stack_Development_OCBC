/*

--For resetting tables--

drop table BankTransaction
drop table Card
drop table Account
drop table Profile
*/


/*--------------------- Start Below Here ---------------------*/

create database OCBC_DB
go

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
	Balance		float			not null,
	ProfileId	smallint		not null,
	constraint PK_Account primary key (AccNum),
	constraint FK_Account_ProfileId foreign key (ProfileId)
		references Profile (ProfileId)
)


--Card Table
create table Card
(
	CardNum			char(16)	not null,
	CardName		varchar(25)	not null,
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

--Insert sample values
insert into Profile(FullName, AccessCode, PinHash)
values
('Ben Johnson', '1234567', '$2b$12$XotDxm0656ovIqS/GM6kE.doLo4TKqyvhM21A6ST1KtAswPi5GAXS'),
('Alice Johnson', '2345678', '$2b$12$z4rIi8CITVlHuBsq4miP5.8BEbmFMiO1bXmBRlBVhI0s29Cs8afl2'),
('Bob Smith', '3456789', '$2b$12$rLnEueQZq0iRHVKUZDy7vutrjOmBGKau/uLfo.xnMTHWza13iVr0S'),
('Carol Lee', '4567890', '$2b$12$bcV72RGe07uEYQjUFGxrieUFDs5RCl.d3yCJD9adyK0QorwDKmiIW'),
('David Brown', '5678901', '$2b$12$eJmaZ7edAQ21wCHD1JGis.j.iH2dRIW/VCEPYKPVVhVnhINCd7z7W')

insert into Account(AccNum, Balance, ProfileId)
values
('10000001', 1000.00, 1),
('10000002', 250.75, 2),
('10000003', 500.50, 3),
('10000004', 150.20, 4),
('10000005', 0.00, 5);

insert into Card (CardNum, CardName, DateOfExpiry, CVV, AccNum)	
values
('1234567890123456', 'Guan Quan', '2025-12-31', '123', '10000001'),
('2345678901234567', 'Bob Smith', '2026-11-30', '456', '10000002'),
('3456789012345678', 'Carol Lee', '2025-08-31', '789', '10000003'),
('4567890123456789', 'David Brown', '2025-05-31', '012', '10000004'),
('5678901234567890', 'Eve Williams', '2027-04-30', '345', '10000005');

insert into BankTransaction(TransactDate, TransactAmount, AccSender, AccReceiver)
values
('2024-10-01', 100.50, '10000002','10000001'),
('2024-10-02', 250.00, '10000002', '10000003'),
('2024-10-03', 75.25, '10000003', '10000001'),
('2024-10-04', 150.00, '10000004', '10000005'),
('2024-10-05', 300.00, '10000001', '10000004');