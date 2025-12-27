DROP TABLE IF EXISTS voting_status;
DROP TABLE IF EXISTS anonymous_vote;
DROP TABLE IF EXISTS participant;
DROP TABLE IF EXISTS candidate;
DROP TABLE IF EXISTS party;
DROP TABLE IF EXISTS election;
DROP TABLE IF EXISTS voter;
DROP TABLE IF EXISTS admin;
DROP TABLE IF EXISTS region;

CREATE TABLE region (
  region_id INT AUTO_INCREMENT PRIMARY KEY,
  r_name VARCHAR(100) NOT NULL UNIQUE,
  r_code VARCHAR(10) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  a_name VARCHAR(100) NOT NULL,
  a_email VARCHAR(255) NOT NULL UNIQUE,
  a_password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE voter (
  voter_id INT AUTO_INCREMENT PRIMARY KEY,
  v_name VARCHAR(100) NOT NULL,
  v_email VARCHAR(255) NOT NULL UNIQUE,
  v_password VARCHAR(255) NOT NULL,
  region_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (region_id) REFERENCES region(region_id)
);

CREATE TABLE election (
  election_id INT AUTO_INCREMENT PRIMARY KEY,
  e_name VARCHAR(200) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  region_id INT NOT NULL,
  admin_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (region_id) REFERENCES region(region_id),
  FOREIGN KEY (admin_id) REFERENCES admin(admin_id)
);

CREATE TABLE party (
  party_id INT AUTO_INCREMENT PRIMARY KEY,
  p_name VARCHAR(100) NOT NULL UNIQUE,
  p_symbol VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE candidate (
  candidate_id INT AUTO_INCREMENT PRIMARY KEY,
  c_name VARCHAR(100) NOT NULL,
  party_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (party_id) REFERENCES party(party_id)
);

CREATE TABLE participant (
  participant_id INT AUTO_INCREMENT PRIMARY KEY,
  candidate_id INT NOT NULL,
  election_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (candidate_id, election_id),
  FOREIGN KEY (candidate_id) REFERENCES candidate(candidate_id),
  FOREIGN KEY (election_id) REFERENCES election(election_id)
);

CREATE TABLE anonymous_vote (
  vote_id INT AUTO_INCREMENT PRIMARY KEY,
  election_id INT NOT NULL,
  candidate_id INT NOT NULL,
  voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (election_id) REFERENCES election(election_id),
  FOREIGN KEY (candidate_id) REFERENCES candidate(candidate_id)
);

CREATE TABLE voting_status (
  status_id INT AUTO_INCREMENT PRIMARY KEY,
  voter_id INT NOT NULL,
  election_id INT NOT NULL,
  has_voted TINYINT(1) DEFAULT 0,
  voted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (voter_id, election_id),
  FOREIGN KEY (voter_id) REFERENCES voter(voter_id),
  FOREIGN KEY (election_id) REFERENCES election(election_id)
);
