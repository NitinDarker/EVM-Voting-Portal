INSERT INTO region (r_name, r_code) VALUES
('Andhra Pradesh', 'AP'),
('Arunachal Pradesh', 'AR'),
('Assam', 'AS'),
('Bihar', 'BR'),
('Chhattisgarh', 'CG'),
('Goa', 'GA'),
('Gujarat', 'GJ'),
('Haryana', 'HR'),
('Himachal Pradesh', 'HP'),
('Jharkhand', 'JH'),
('Karnataka', 'KA'),
('Kerala', 'KL'),
('Madhya Pradesh', 'MP'),
('Maharashtra', 'MH'),
('Manipur', 'MN'),
('Meghalaya', 'ML'),
('Mizoram', 'MZ'),
('Nagaland', 'NL'),
('Odisha', 'OR'),
('Punjab', 'PB'),
('Rajasthan', 'RJ'),
('Sikkim', 'SK'),
('Tamil Nadu', 'TN'),
('Telangana', 'TS'),
('Tripura', 'TR'),
('Uttar Pradesh', 'UP'),
('Uttarakhand', 'UK'),
('West Bengal', 'WB'),
('Andaman and Nicobar Islands', 'AN'),
('Chandigarh', 'CH'),
('Dadra and Nagar Haveli and Daman and Diu', 'DH'),
('Delhi', 'DL'),
('Jammu and Kashmir', 'JK'),
('Ladakh', 'LA'),
('Lakshadweep', 'LD'),
('Puducherry', 'PY');

INSERT INTO party (p_name, p_symbol) VALUES
('Bharatiya Janata Party', '🪷'),
('Indian National Congress', '✋'),
('Aam Aadmi Party', '🧹'),
('Trinamool Congress', '🌾'),
('Dravida Munnetra Kazhagam', '🌅'),
('Shiv Sena', '🏹'),
('Nationalist Congress Party', '⏰'),
('Communist Party of India (Marxist)', '⚒️'),
('Bahujan Samaj Party', '🐘'),
('Samajwadi Party', '🚲'),
('Janata Dal (United)', '🪶'),
('Biju Janata Dal', '🚜'),
('Telugu Desam Party', '🚗'),
('YSR Congress Party', '🌾'),
('Independent', '🔵');

-- Password: Admin@123
INSERT INTO admin (a_name, a_email, a_password) VALUES
('System Admin', 'admin@evm.gov.in', '$2b$10$rQ1KvF5O8xJN/YZK9KzJ2OK3f.hLHpGZyF6SLBiLWJ3h8YD3/9YQW');

-- Password: Voter@123
INSERT INTO voter (v_name, v_email, v_password, region_id) VALUES
('Rajesh Kumar', 'rajesh.kumar@example.com', '$2b$10$X9eH8jxJp9YVo6FMB/7yTOgKzXLqH0RqV3mMkVZ8vD3YwQE6OYC0S',
  (SELECT region_id FROM region WHERE r_name = 'Delhi')),
('Priya Sharma', 'priya.sharma@example.com', '$2b$10$X9eH8jxJp9YVo6FMB/7yTOgKzXLqH0RqV3mMkVZ8vD3YwQE6OYC0S',
  (SELECT region_id FROM region WHERE r_name = 'Maharashtra')),
('Amit Patel', 'amit.patel@example.com', '$2b$10$X9eH8jxJp9YVo6FMB/7yTOgKzXLqH0RqV3mMkVZ8vD3YwQE6OYC0S',
  (SELECT region_id FROM region WHERE r_name = 'Gujarat')),
('Lakshmi Iyer', 'lakshmi.iyer@example.com', '$2b$10$X9eH8jxJp9YVo6FMB/7yTOgKzXLqH0RqV3mMkVZ8vD3YwQE6OYC0S',
  (SELECT region_id FROM region WHERE r_name = 'Tamil Nadu')),
('Suresh Reddy', 'suresh.reddy@example.com', '$2b$10$X9eH8jxJp9YVo6FMB/7yTOgKzXLqH0RqV3mMkVZ8vD3YwQE6OYC0S',
  (SELECT region_id FROM region WHERE r_name = 'Telangana'));

INSERT INTO candidate (c_name, party_id) VALUES
('Narendra Modi', (SELECT party_id FROM party WHERE p_name = 'Bharatiya Janata Party')),
('Amit Shah', (SELECT party_id FROM party WHERE p_name = 'Bharatiya Janata Party')),
('Rajnath Singh', (SELECT party_id FROM party WHERE p_name = 'Bharatiya Janata Party')),
('Rahul Gandhi', (SELECT party_id FROM party WHERE p_name = 'Indian National Congress')),
('Priyanka Gandhi', (SELECT party_id FROM party WHERE p_name = 'Indian National Congress')),
('Mallikarjun Kharge', (SELECT party_id FROM party WHERE p_name = 'Indian National Congress')),
('Arvind Kejriwal', (SELECT party_id FROM party WHERE p_name = 'Aam Aadmi Party')),
('Manish Sisodia', (SELECT party_id FROM party WHERE p_name = 'Aam Aadmi Party')),
('Mamata Banerjee', (SELECT party_id FROM party WHERE p_name = 'Trinamool Congress')),
('M K Stalin', (SELECT party_id FROM party WHERE p_name = 'Dravida Munnetra Kazhagam')),
('Uddhav Thackeray', (SELECT party_id FROM party WHERE p_name = 'Shiv Sena')),
('Sharad Pawar', (SELECT party_id FROM party WHERE p_name = 'Nationalist Congress Party')),
('Akhilesh Yadav', (SELECT party_id FROM party WHERE p_name = 'Samajwadi Party')),
('Mayawati', (SELECT party_id FROM party WHERE p_name = 'Bahujan Samaj Party')),
('Nitish Kumar', (SELECT party_id FROM party WHERE p_name = 'Janata Dal (United)'));

INSERT INTO election (e_name, start_time, end_time, region_id, admin_id) VALUES
('Delhi Assembly Election 2025',
  DATE_ADD(NOW(), INTERVAL -5 DAY),
  DATE_ADD(NOW(), INTERVAL 5 DAY),
  (SELECT region_id FROM region WHERE r_name = 'Delhi'),
  (SELECT admin_id FROM admin WHERE a_email = 'admin@evm.gov.in')),
('Maharashtra Assembly Election 2025',
  DATE_ADD(NOW(), INTERVAL -3 DAY),
  DATE_ADD(NOW(), INTERVAL 7 DAY),
  (SELECT region_id FROM region WHERE r_name = 'Maharashtra'),
  (SELECT admin_id FROM admin WHERE a_email = 'admin@evm.gov.in')),
('Gujarat Assembly Election 2024',
  DATE_ADD(NOW(), INTERVAL -60 DAY),
  DATE_ADD(NOW(), INTERVAL -30 DAY),
  (SELECT region_id FROM region WHERE r_name = 'Gujarat'),
  (SELECT admin_id FROM admin WHERE a_email = 'admin@evm.gov.in')),
('Tamil Nadu Assembly Election 2025',
  DATE_ADD(NOW(), INTERVAL 10 DAY),
  DATE_ADD(NOW(), INTERVAL 20 DAY),
  (SELECT region_id FROM region WHERE r_name = 'Tamil Nadu'),
  (SELECT admin_id FROM admin WHERE a_email = 'admin@evm.gov.in'));

INSERT INTO participant (candidate_id, election_id) VALUES
((SELECT candidate_id FROM candidate WHERE c_name = 'Arvind Kejriwal'),
 (SELECT election_id FROM election WHERE e_name = 'Delhi Assembly Election 2025')),
((SELECT candidate_id FROM candidate WHERE c_name = 'Manish Sisodia'),
 (SELECT election_id FROM election WHERE e_name = 'Delhi Assembly Election 2025')),
((SELECT candidate_id FROM candidate WHERE c_name = 'Narendra Modi'),
 (SELECT election_id FROM election WHERE e_name = 'Delhi Assembly Election 2025')),
((SELECT candidate_id FROM candidate WHERE c_name = 'Rahul Gandhi'),
 (SELECT election_id FROM election WHERE e_name = 'Delhi Assembly Election 2025'));

INSERT INTO participant (candidate_id, election_id) VALUES
((SELECT candidate_id FROM candidate WHERE c_name = 'Uddhav Thackeray'),
 (SELECT election_id FROM election WHERE e_name = 'Maharashtra Assembly Election 2025')),
((SELECT candidate_id FROM candidate WHERE c_name = 'Sharad Pawar'),
 (SELECT election_id FROM election WHERE e_name = 'Maharashtra Assembly Election 2025')),
((SELECT candidate_id FROM candidate WHERE c_name = 'Amit Shah'),
 (SELECT election_id FROM election WHERE e_name = 'Maharashtra Assembly Election 2025')),
((SELECT candidate_id FROM candidate WHERE c_name = 'Priyanka Gandhi'),
 (SELECT election_id FROM election WHERE e_name = 'Maharashtra Assembly Election 2025'));

INSERT INTO participant (candidate_id, election_id) VALUES
((SELECT candidate_id FROM candidate WHERE c_name = 'Narendra Modi'),
 (SELECT election_id FROM election WHERE e_name = 'Gujarat Assembly Election 2024')),
((SELECT candidate_id FROM candidate WHERE c_name = 'Rahul Gandhi'),
 (SELECT election_id FROM election WHERE e_name = 'Gujarat Assembly Election 2024')),
((SELECT candidate_id FROM candidate WHERE c_name = 'Arvind Kejriwal'),
 (SELECT election_id FROM election WHERE e_name = 'Gujarat Assembly Election 2024'));

INSERT INTO participant (candidate_id, election_id) VALUES
((SELECT candidate_id FROM candidate WHERE c_name = 'M K Stalin'),
 (SELECT election_id FROM election WHERE e_name = 'Tamil Nadu Assembly Election 2025')),
((SELECT candidate_id FROM candidate WHERE c_name = 'Rajnath Singh'),
 (SELECT election_id FROM election WHERE e_name = 'Tamil Nadu Assembly Election 2025')),
((SELECT candidate_id FROM candidate WHERE c_name = 'Mallikarjun Kharge'),
 (SELECT election_id FROM election WHERE e_name = 'Tamil Nadu Assembly Election 2025'));

INSERT INTO anonymous_vote (election_id, candidate_id)
SELECT
  (SELECT election_id FROM election WHERE e_name = 'Gujarat Assembly Election 2024'),
  (SELECT candidate_id FROM candidate WHERE c_name = 'Narendra Modi')
FROM
  (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
   UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
   UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15) AS numbers;

INSERT INTO anonymous_vote (election_id, candidate_id)
SELECT
  (SELECT election_id FROM election WHERE e_name = 'Gujarat Assembly Election 2024'),
  (SELECT candidate_id FROM candidate WHERE c_name = 'Rahul Gandhi')
FROM
  (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
   UNION SELECT 6 UNION SELECT 7 UNION SELECT 8) AS numbers;

INSERT INTO anonymous_vote (election_id, candidate_id)
SELECT
  (SELECT election_id FROM election WHERE e_name = 'Gujarat Assembly Election 2024'),
  (SELECT candidate_id FROM candidate WHERE c_name = 'Arvind Kejriwal')
FROM
  (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) AS numbers;

INSERT INTO voting_status (voter_id, election_id, has_voted) VALUES
((SELECT voter_id FROM voter WHERE v_email = 'amit.patel@example.com'),
 (SELECT election_id FROM election WHERE e_name = 'Gujarat Assembly Election 2024'), 1);
