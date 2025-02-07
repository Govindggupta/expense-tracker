import { neon } from '@neondatabase/serverless';
import { v4 as uuidv4 } from 'uuid';

const walletId = uuidv4();

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { name, email, clerkId } = await request.json();

    if (!name || !email || !clerkId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const existingUser = await sql`
      SELECT clerk_id FROM "User" WHERE clerk_id = ${clerkId} LIMIT 1;
    `;

    let userClerkId;

    if (existingUser.length > 0) {
      userClerkId = existingUser[0].clerk_id;
    } else {
      const newUser = await sql`
        INSERT INTO "User" (clerk_id, name, email)
        VALUES (${clerkId}, ${name}, ${email})
        RETURNING clerk_id;
      `;

      userClerkId = newUser[0]?.clerk_id;

      // Create a default wallet for the new user
      await sql`
        INSERT INTO "Wallet" (id, "userId", name, balance )
        VALUES (${walletId}, ${userClerkId}, 'Cash', 0)
        RETURNING id;
      `;
    }

    return new Response(JSON.stringify({ clerkId: userClerkId }), { status: 201 });
  } catch (error) {
    console.error('Error creating or fetching user:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// // THIS IS FOR CONNECTING THE LOCAL POSTGRES DB

// import { Client } from 'pg';

// export async function POST(request: Request) {
//   const client = new Client({
//     connectionString: process.env.DATABASE_URL, // Use the local connection string
//   });

//   try {
//     await client.connect();

//     const { name, email, clerkId } = await request.json();

//     if (!name || !email || !clerkId) {
//       return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
//     }

//     // Check if the user already exists using clerk_id
//     const existingUser = await client.query(`
//       SELECT clerk_id FROM "User" WHERE clerk_id = $1 LIMIT 1;
//     `, [clerkId]);

//     let userClerkId;

//     if (existingUser.rows.length > 0) {
//       userClerkId = existingUser.rows[0].clerk_id;
//     } else {
//       // Insert a new user with clerk_id as primary key
//       const newUser = await client.query(`
//         INSERT INTO "User" (clerk_id, name, email)
//         VALUES ($1, $2, $3)
//         RETURNING clerk_id;
//       `, [clerkId, name, email]);

//       userClerkId = newUser.rows[0]?.clerk_id;
//     }

//     return new Response(JSON.stringify({ clerkId: userClerkId }), { status: 201 });
//   } catch (error) {
//     console.error('Error creating or fetching user:', error);
//     return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
//   } finally {
//     await client.end();
//   }
// }
