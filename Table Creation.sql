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

insert into BankTransaction(TransactDate, TransactAmount, AccSender, AccReceiver)
values
('2024-10-01', 100.50, '234-567890-002','123-456789-001'),
('2024-10-02', 250.00, '234-567890-002', '345-678901-003'),
('2024-10-03', 75.25, '345-678901-003', '123-456789-001'),
('2024-10-04', 150.00, '456-789012-004', '567-890123-005'),
('2024-10-05', 300.00, '123-456789-001', '456-789012-004');

   SELECT 
		bt.TransactNo, 
		bt.TransactDate, 
		bt.TransactAmount, 
		bt.AccSender, 
		sender.AccNum AS SenderName, 
		bt.AccReceiver, 
		receiver.AccNum AS ReceiverName
	FROM BankTransaction bt
	JOIN Account sender ON bt.AccSender = sender.AccNum
	JOIN Account receiver ON bt.AccReceiver = receiver.AccNum
	WHERE (bt.AccSender = '123-456789-001' OR bt.AccReceiver = '123-456789-001')
	AND bt.TransactDate BETWEEN	'2024-10-01' AND '2024-10-03'
	ORDER BY bt.TransactDate DESC;