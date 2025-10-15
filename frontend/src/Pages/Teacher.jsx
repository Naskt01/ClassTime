import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import "../styles/styles.css";

function Teacher() {
  const [teacher, setTeacher] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    phone: "",
    employee_id: "",
    subject: "",
    subjects: [],
  });
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    fetchTeachers();
    fetchAvailableSubjects();
  }, []);

  const fetchAvailableSubjects = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/scheduling/available-subjects");
      const data = await response.json();
      setAvailableSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchTeachers = async () => {
    const response = await fetch("http://localhost:5000/api/teachers");
    const data = await response.json();
    setTeacher(data);
    setFilteredTeachers(data);
  };

  useEffect(() => {
    let result = teacher;
    if (searchQuery) {
      result = result.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedSubject) {
      result = result.filter((t) => {
        if (t.subjects && Array.isArray(t.subjects)) {
          return t.subjects.some(
            (subj) => subj.toLowerCase() === selectedSubject.toLowerCase()
          );
        }
        return t.subject && t.subject.toLowerCase() === selectedSubject.toLowerCase();
      });
    }
    setFilteredTeachers(result);
  }, [searchQuery, selectedSubject, teacher]);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.subjects || formData.subjects.length === 0) {
      alert("Please select at least one subject for the teacher.");
      return;
    }

    try {
      const url = editingTeacher
        ? `http://localhost:5000/api/teachers/${editingTeacher.id}`
        : "http://localhost:5000/api/teachers";
      const method = editingTeacher ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save teacher");

      fetchTeachers();
      handleCancel();
      alert(editingTeacher ? "Teacher updated successfully!" : "Teacher created successfully!");
    } catch (error) {
      console.error("Error saving teacher:", error);
      alert("Error saving teacher. Please try again.");
    }
  };

  const handleDelete = async (teacherId) => {
    await fetch(`http://localhost:5000/api/teachers/${teacherId}`, { method: "DELETE" });
    fetchTeachers();
  };

  const handleEdit = (teacherToEdit) => {
    setEditingTeacher(teacherToEdit);
    setFormData({
      name: teacherToEdit.name,
      email: teacherToEdit.email,
      username: teacherToEdit.username,
      password: "",
      phone: teacherToEdit.phone || "",
      employee_id: teacherToEdit.employee_id || "",
      subject: teacherToEdit.subject || "",
      subjects: teacherToEdit.subjects || [teacherToEdit.subject || ""],
    });
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingTeacher(null);
    setFormData({
      name: "",
      email: "",
      username: "",
      password: "",
      phone: "",
      employee_id: "",
      subject: "",
      subjects: [],
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTeacher(null);
    setFormData({
      name: "",
      email: "",
      username: "",
      password: "",
      phone: "",
      employee_id: "",
      subject: "",
      subjects: [],
    });
  };

  const uniqueSubjects = [...new Set(teacher.flatMap((t) => t.subjects || [t.subject]).filter(Boolean))];

  return (
    <Layout>
      <div className="page-header">
        <h1>Teacher Management</h1>
        <button className="btn" onClick={handleAdd}>Add Teacher</button>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="filter-dropdown"
        >
          <option value="">All Subjects</option>
          {uniqueSubjects.map((subj, idx) => (
            <option key={idx} value={subj}>
              {subj}
            </option>
          ))}
        </select>
      </div>

      {/* Teacher Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Subject(s)</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredTeachers.length > 0 ? (
            filteredTeachers.map((t) => (
              <tr key={t.id}>
                <td>{t.employee_id}</td>
                <td>{t.name}</td>
                <td>{t.subjects_display || t.subjects?.join(", ") || t.subject}</td>
                <td>{t.email}</td>
                <td>{t.phone}</td>
                <td>
                  <button className="edit" onClick={() => handleEdit(t)}>Edit</button> |{" "}
                  <button className="delete" onClick={() => handleDelete(t.id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No teachers found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingTeacher ? "Edit Teacher" : "Add Teacher"}</h2>
            <form className="modal-form" onSubmit={handleSave}>
              <label>Full Name*</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <label>Email*</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              {!editingTeacher && (
                <>
                  <label>Username*</label>
                  <input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />

                  <label>Password*</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </>
              )}

              <label>Employee ID*</label>
              <input
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                required
              />

              <label>Phone*</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />

              <label>Subjects*</label>
              <div className="subject-checkbox-container">
                {availableSubjects.length === 0 ? (
                <div className="loading-subjects">Loading subjects...</div>
              ) : (
                availableSubjects.map((subj, idx) => (
                  <label key={idx} className="subject-checkbox">
                    <input
                      type="checkbox"
                      value={subj}
                      checked={formData.subjects.includes(subj)}
                      onChange={(e) => {
                        let newSubjects;
                        if (e.target.checked) {
                          newSubjects = [...formData.subjects, subj];
                        } else {
                          newSubjects = formData.subjects.filter((s) => s !== subj);
                        }
                        setFormData({
                          ...formData,
                          subjects: newSubjects,
                          subject: newSubjects[0] || "",
                        });
                      }}
                    />
                    {subj}
                  </label>
                ))
              )}
              </div>

              {formData.subjects.length > 0 ? (
                <small className="selected-subjects">
                  Selected ({formData.subjects.length}): {formData.subjects.join(", ")}
                </small>
              ) : (
                <small className="selected-subjects warning">
                  Please select at least one subject
                </small>
              )}

              <div className="modal-actions">
                <button type="button" className="btn cancel" onClick={handleCancel}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={formData.subjects.length === 0}
                  style={{
                    opacity: formData.subjects.length === 0 ? 0.6 : 1,
                    cursor: formData.subjects.length === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Teacher;

