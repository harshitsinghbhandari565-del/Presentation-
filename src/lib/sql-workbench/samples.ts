export interface Sample { id: string; name: string; description: string; sql: string; starter: string }

/** Entirely fictional classroom data, loaded into the visitor's own browser. */
export const samples: Sample[] = [
  { id: "school", name: "School management", description: "Classes, students and enrolments", sql: `
CREATE TABLE classes (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, teacher TEXT NOT NULL);
CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT NOT NULL, marks INTEGER NOT NULL CHECK (marks BETWEEN 0 AND 100));
CREATE TABLE enrolments (student_id INTEGER NOT NULL REFERENCES students(id), class_id INTEGER NOT NULL REFERENCES classes(id), PRIMARY KEY (student_id, class_id));
INSERT INTO classes VALUES (1, 'Mathematics', 'Ms. Rao'), (2, 'Science', 'Mr. Sen');
INSERT INTO students VALUES (1, 'Aarav', 92), (2, 'Mira', 85), (3, 'Kabir', 74), (4, 'Zoya', 96);
INSERT INTO enrolments VALUES (1,1), (2,1), (3,2), (4,2);`, starter: `SELECT name, marks\nFROM students\nWHERE marks > 80\nORDER BY marks DESC;` },
  { id: "students", name: "Student records", description: "Students and subject scores", sql: `
CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT NOT NULL, grade TEXT NOT NULL);
CREATE TABLE scores (student_id INTEGER REFERENCES students(id), subject TEXT NOT NULL, marks INTEGER CHECK (marks BETWEEN 0 AND 100), PRIMARY KEY(student_id, subject));
INSERT INTO students VALUES (1,'Anika','12'),(2,'Dev','12'),(3,'Isha','11');
INSERT INTO scores VALUES (1,'Mathematics',88),(1,'English',91),(2,'Mathematics',76),(3,'English',84);`, starter: `SELECT students.name, scores.subject, scores.marks\nFROM students JOIN scores ON students.id = scores.student_id\nORDER BY scores.marks DESC;` },
  { id: "employees", name: "Employee management", description: "Departments and employees", sql: `
CREATE TABLE departments (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE);
CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT NOT NULL, department_id INTEGER REFERENCES departments(id), salary INTEGER CHECK (salary >= 0));
INSERT INTO departments VALUES (1,'Engineering'),(2,'Design');
INSERT INTO employees VALUES (1,'Naina',1,65000),(2,'Ravi',1,58000),(3,'Sana',2,62000);`, starter: `SELECT d.name AS department, AVG(e.salary) AS average_salary\nFROM employees e JOIN departments d ON d.id = e.department_id\nGROUP BY d.name;` },
  { id: "library", name: "Library management", description: "Books, members and loans", sql: `
CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT NOT NULL, author TEXT NOT NULL);
CREATE TABLE members (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE loans (id INTEGER PRIMARY KEY, book_id INTEGER REFERENCES books(id), member_id INTEGER REFERENCES members(id), loan_date TEXT NOT NULL, returned INTEGER NOT NULL DEFAULT 0 CHECK (returned IN (0,1)));
INSERT INTO books VALUES (1,'The Blue Planet','R. Sharma'),(2,'A Journey Through Numbers','A. Das'),(3,'Starlight','M. Roy');
INSERT INTO members VALUES (1,'Meera'),(2,'Arjun');
INSERT INTO loans VALUES (1,1,1,'2026-01-05',0),(2,2,2,'2026-01-10',1);`, starter: `SELECT b.title, m.name AS member, l.loan_date\nFROM loans l JOIN books b ON b.id = l.book_id\nJOIN members m ON m.id = l.member_id\nWHERE l.returned = 0;` },
  { id: "hospital", name: "Hospital management", description: "Doctors, patients and appointments", sql: `
CREATE TABLE doctors (id INTEGER PRIMARY KEY, name TEXT NOT NULL, specialty TEXT NOT NULL);
CREATE TABLE patients (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE appointments (id INTEGER PRIMARY KEY, patient_id INTEGER REFERENCES patients(id), doctor_id INTEGER REFERENCES doctors(id), appointment_date TEXT NOT NULL);
INSERT INTO doctors VALUES (1,'Dr. Mehta','Cardiology'),(2,'Dr. Iyer','General medicine');
INSERT INTO patients VALUES (1,'Patient A'),(2,'Patient B'),(3,'Patient C');
INSERT INTO appointments VALUES (1,1,1,'2026-02-01'),(2,2,2,'2026-02-02'),(3,3,1,'2026-02-03');`, starter: `SELECT d.name, COUNT(*) AS appointments\nFROM appointments a JOIN doctors d ON d.id = a.doctor_id\nGROUP BY d.id, d.name;` },
  { id: "commerce", name: "E-commerce", description: "Products, customers and orders", sql: `
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, price INTEGER NOT NULL CHECK (price >= 0));
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(id), product_id INTEGER REFERENCES products(id), quantity INTEGER NOT NULL CHECK (quantity > 0));
INSERT INTO customers VALUES (1,'Asha'),(2,'Vikram');
INSERT INTO products VALUES (1,'Notebook',120),(2,'Pen set',80),(3,'Ruler',30);
INSERT INTO orders VALUES (1,1,1,2),(2,1,2,1),(3,2,3,4);`, starter: `SELECT c.name, SUM(p.price * o.quantity) AS total\nFROM orders o JOIN customers c ON c.id = o.customer_id\nJOIN products p ON p.id = o.product_id\nGROUP BY c.id, c.name;` },
  { id: "banking", name: "Banking demonstration", description: "Accounts and transactions (fictional)", sql: `
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE accounts (id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(id), balance INTEGER NOT NULL CHECK (balance >= 0));
CREATE TABLE transactions (id INTEGER PRIMARY KEY, account_id INTEGER REFERENCES accounts(id), amount INTEGER NOT NULL, note TEXT);
INSERT INTO customers VALUES (1,'Customer A'),(2,'Customer B');
INSERT INTO accounts VALUES (101,1,2500),(102,2,1800);
INSERT INTO transactions VALUES (1,101,500,'Deposit'),(2,102,-200,'Withdrawal');`, starter: `SELECT c.name, a.id AS account_id, a.balance\nFROM accounts a JOIN customers c ON c.id = a.customer_id\nORDER BY a.balance DESC;` },
];
