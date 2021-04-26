DROP TABLE IF EXISTS joke;
CREATE TABLE joke(
    id SERIAL PRIMARY KEY,
    number VARCHAR(255),
    type  VARCHAR(255),
    setup TEXT,
    punchline TEXT

) 

