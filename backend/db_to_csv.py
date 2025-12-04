import sqlite3
import csv

# Connect to SQLite database
conn = sqlite3.connect("./app/test5.db")
cursor = conn.cursor()

# Select data from a table
cursor.execute("SELECT * FROM places")
rows = cursor.fetchall()

# Get column headers
headers = [description[0] for description in cursor.description]

# Write to CSV file
with open("output_file.csv", "w", newline="", encoding="utf-8") as csvfile:
    csv_writer = csv.writer(csvfile)
    csv_writer.writerow(headers)  # Write headers
    csv_writer.writerows(rows)  # Write data rows

# Close connection
conn.close()
