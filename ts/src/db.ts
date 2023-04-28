// import pg from "pg";
// const { Pool } = pg;

// const DB_CONFIG = {
//   host: process.env.DB_HOST,
//   port: parseInt(process.env.DB_PORT as string),
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
// };
// const pool = new Pool(DB_CONFIG);

// const db = {
//   async query(text: string, params: (string | number)[]) {
//     try {
//       const result = await pool.query(text, params);
//       if (result) {
//         return result.rows as any[];
//       } else return [];
//     } catch (error) {
//       console.log(error);
//       return [];
//     }
//   },
// };

// export default db;
