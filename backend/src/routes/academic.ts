import express from 'express';
import { queryPg } from '../db_pg';

const router = express.Router();

// Academic Hierarchy: Departments -> Degree Courses -> Teachings
router.get('/hierarchy', async (req, res) => {
  try {
    const query = `
      SELECT 
        d.id as dept_id, d.name as dept_name,
        c.id as course_id, c.name as course_name, c.cfu as course_cfu,
        t.id as teaching_id, t.name as teaching_name, t.teacher_id
      FROM departments d
      LEFT JOIN degree_courses c ON c.department_id = d.id
      LEFT JOIN teachings t ON t.degree_course_id = c.id
      ORDER BY d.name, c.name, t.name;
    `;
    const pgRes = await queryPg(query);
    const results = pgRes.rows;

    // Structure flat results into tree hierarchy
    const departmentsMap: Record<number, any> = {};

    results.forEach(row => {
      if (!row.dept_id) return;
      if (!departmentsMap[row.dept_id]) {
        departmentsMap[row.dept_id] = {
          id: row.dept_id,
          name: row.dept_name,
          courses: {}
        };
      }

      if (row.course_id) {
        if (!departmentsMap[row.dept_id].courses[row.course_id]) {
          departmentsMap[row.dept_id].courses[row.course_id] = {
            id: row.course_id,
            name: row.course_name,
            cfu: row.course_cfu,
            teachings: []
          };
        }

        if (row.teaching_id) {
          departmentsMap[row.dept_id].courses[row.course_id].teachings.push({
            id: row.teaching_id,
            name: row.teaching_name,
            teacher_id: row.teacher_id
          });
        }
      }
    });

    const hierarchy = Object.values(departmentsMap).map(dept => ({
      id: dept.id,
      name: dept.name,
      courses: Object.values(dept.courses)
    }));

    res.json(hierarchy);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
