
import mysql from "mysql2/promise";
export const db=mysql.createPool({
host:"localhost",
user:"root",
password:"gbakshi21@0618",
database:"new_sql"
});