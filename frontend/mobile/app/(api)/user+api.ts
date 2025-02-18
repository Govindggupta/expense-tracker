import { neon } from '@neondatabase/serverless';
import { v4 as uuidv4 } from 'uuid';

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
        INSERT INTO "Wallet" (id, "userId", name, balance)
        VALUES (${uuidv4()}, ${userClerkId}, 'Cash', 0)
      `;

      // Predefined categories: Minimum 5 Expense and 3 Income categories
      const expenseCategories = [
        { name: 'Food', type: 'EXPENSE' },
        { name: 'Transport', type: 'EXPENSE' },
        { name: 'Bills', type: 'EXPENSE' },
        { name: 'Entertainment', type: 'EXPENSE' },
        { name: 'Healthcare', type: 'EXPENSE' },
      ];

      const incomeCategories = [
        { name: 'Salary', type: 'INCOME' },
        { name: 'Freelancing', type: 'INCOME' },
        { name: 'Investments', type: 'INCOME' },
      ];

      for (const category of [...expenseCategories, ...incomeCategories]) {
        await sql`
          INSERT INTO "Category" (id, "userId", name, type)
          VALUES (${uuidv4()}, ${userClerkId}, ${category.name}, ${category.type})
        `;
      }
    }

    return new Response(JSON.stringify({ clerkId: userClerkId }), { status: 201 });
  } catch (error) {
    console.error('Error creating or fetching user:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
