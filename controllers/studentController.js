const pool = require('../config/db');
const redisClient = require('../config/redis');
const { v4: uuidv4 } = require('uuid');

/**
 * Register a student's club preferences.
 * Automatically generates both `allotment_id` and `reg_id`.
 */
exports.registerClubPreferences = async (req, res) => {
  const { student_id, preferences } = req.body;

  // Validate input
  if (!student_id || !Array.isArray(preferences) || preferences.length === 0) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const client = await pool.connect(); // Get a DB client to manage transactions
  try {
    await client.query('BEGIN'); // Start transaction

    // Iterate over each preference
    for (let i = 0; i < preferences.length; i++) {
      const club_id = preferences[i];

      const redisKey = `club:${club_id}:count`;
      let currentCount = await redisClient.get(redisKey);

      // Fallback to DB if Redis doesn't have the value
      if (currentCount === null) {
        const dbRes = await client.query(
          'SELECT curr_allotment FROM "Clubs" WHERE club_id = $1',
          [club_id]
        );
        if (dbRes.rows.length === 0) continue;
        currentCount = dbRes.rows[0].curr_allotment;
        await redisClient.set(redisKey, currentCount);
      }

      const maxVacancyRes = await client.query(
        'SELECT max_vacancy FROM "Clubs" WHERE club_id = $1',
        [club_id]
      );
      const maxVacancy = maxVacancyRes.rows[0]?.max_vacancy;

      if (parseInt(currentCount) < maxVacancy) {
        // Generate both IDs
        const reg_id = uuidv4().slice(0, 10); // Generate reg_id for Registration
        const allotment_id = uuidv4().slice(0, 10); // Generate allotment_id for Allotment

        // Insert into Registrations FIRST (to create the reg_id)
        await client.query(
          `INSERT INTO "Registrations"(reg_id, student_id, club_id, deadline, pref_value) 
           VALUES ($1, $2, $3, NOW() + INTERVAL '7 days', $4)`,
          [reg_id, student_id, club_id, i + 1]
        );




        // Before inserting into "Allotment", ensure the 'type' is always valid.
        const type = (i === 0) ? 'Primary' : 'Associate';

        // Validate the type before proceeding (optional but can be useful for debugging)
        if (type !== 'Primary' && type !== 'Associate') {
        console.error('Invalid type value:', type); // Debugging log
        throw new Error('Invalid type value. Only "Primary" or "Associate" are allowed.');
        }
        // Then insert into Allotment using the reg_id
        await client.query(
            `INSERT INTO "Allotment"(allotment_id, reg_id, student_id, club_id, alloted_at, status, type) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                allotment_id,
                reg_id,
                student_id,
                club_id,
                new Date(),  // current date/time for alloted_at
                'Active',    // default status
                type  // Ensure type is always 'Primary' or 'Associate'
            ]
            );


        // Update Redis and DB
        await redisClient.incr(redisKey); // Increment count in Redis
        await client.query(
          `UPDATE "Clubs" SET curr_allotment = curr_allotment + 1 WHERE club_id = $1`,
          [club_id]
        );
      }
    }

    // Commit the transaction after all operations are successful
    await client.query('COMMIT');
    return res.status(200).json({ message: 'All club preferences processed' });

  } catch (error) {
    // Rollback transaction if any error occurs
    await client.query('ROLLBACK');
    console.error("FULL ERROR:", error);
    return res.status(500).json({
      error: 'Internal Server Error',
      details: error.message,
      stack: error.stack
    });
  } finally {
    client.release(); // Release the DB client
  }
};

/**
 * Get all clubs that still have available seats.
 */
exports.getAvailableClubs = async (req, res) => {
  try {
    const clubsRes = await pool.query('SELECT club_id, club_name, max_vacancy FROM "Clubs"');

    const clubData = await Promise.all(
      clubsRes.rows.map(async (club) => {
        const redisKey = `club:${club.club_id}:count`;
        let currentCount = await redisClient.get(redisKey);

        // If Redis doesn't have it, use DB
        if (currentCount === null) {
          const dbCountRes = await pool.query(
            'SELECT curr_allotment FROM "Clubs" WHERE club_id = $1',
            [club.club_id]
          );
          currentCount = dbCountRes.rows[0]?.curr_allotment ?? 0;
          await redisClient.set(redisKey, currentCount); // Cache it
        }

        return {
          club_id: club.club_id,
          club_name: club.club_name,
          available: club.max_vacancy - parseInt(currentCount),
        };
      })
    );

    // Filter out fully allotted clubs
    const availableClubs = clubData.filter((c) => c.available > 0);

    res.status(200).json(availableClubs);
  } catch (error) {
    console.error('Error fetching available clubs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
