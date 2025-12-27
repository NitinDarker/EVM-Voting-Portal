# EVM Database

Database for electronic voting machine system.

## Tables

- **region** - Indian states and union territories
- **admin** - System administrators
- **voter** - Registered voters
- **election** - Elections with start/end times
- **party** - Political parties
- **candidate** - Candidates linked to parties
- **participant** - Links candidates to elections
- **anonymous_vote** - Anonymous votes (no voter info)
- **voting_status** - Tracks if voter has voted

## How it works

- Admins create elections for specific regions
- Candidates are added to elections via participant table
- Voters can vote once per election
- Votes are anonymous - stored separately from voter records
- voting_status tracks who voted without revealing their choice

## Docker Setup

Start database:
```bash
docker-compose up -d
```

Access MySQL:
```bash
docker exec -it evm_mysql mysql -u evm_user -pevm_password evm_db
```

## Sample Credentials

- Admin: admin@evm.gov.in / Admin@123
- Voter: rajesh.kumar@example.com / Voter@123
