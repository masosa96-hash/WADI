/**
 * Projects & Tasks Module
 * Gestión básica de proyectos.
 */

class Task {
  constructor(title, status = "todo") {
    this.id = Math.random().toString(36).substr(2, 9);
    this.title = title;
    this.status = status;
    this.createdAt = new Date();
  }
}

class Project {
  constructor(name) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.name = name;
    this.tasks = [];
  }

  addTask(title) {
    const task = new Task(title);
    this.tasks.push(task);
    return task;
  }
}

export const createProject = async (name) => {
  console.log("[Project] Creating project:", name);
  return new Project(name);
};

export const listProjects = async () => {
  return []; // Placeholder
};
