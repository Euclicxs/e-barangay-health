// SHARED PUROK DATA & HELPERS
// Loaded by admin.html (Purok Masterlists & Data Analytics), child.html, maternal.html, reports.html.

// COMPUTE STATUS FROM DATES
function computeStatus(nextVisitDate, lastVisitDate) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (lastVisitDate && nextVisitDate) {
    const next = new Date(nextVisitDate);
    const nextDay = new Date(next.getFullYear(), next.getMonth(), next.getDate());

    if (nextDay < today) {
      return 'Overdue';
    }
    if (nextDay.getMonth() === today.getMonth() && nextDay.getFullYear() === today.getFullYear()) {
      return 'Due This Month';
    }
    return 'Completed';
  }
  if (!nextVisitDate && lastVisitDate) {
    return 'Completed';
  }
  return 'Due This Month';
}

function getOverdueDays(nextVisitDate) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const next = new Date(nextVisitDate);
  const nextDay = new Date(next.getFullYear(), next.getMonth(), next.getDate());
  const diff = today - nextDay;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const VACCINES = ['BCG', 'OPV', 'IPV', 'PENTA', 'PCV', 'MCV1', 'MCV2'];

// DATABASE PER PUROK
const purokData = {
  calachuchi: {
    name: "Calachuchi",
    households: 14,
    bhws: "Prelin L. Veriño · Flora L. Tangoan",
    bhwCount: 2,
    records: [
      { code: "NKT-C-001", name: "Amara Grace Dela Cruz", type: "Child", sex: "Female", address: "Blk 1 Lot 3, Purok Calachuchi", birthDate: "2024-11-15", lastVisitDate: "2026-09-05", nextVisitDate: "2026-10-05", weight: 11.8, height: 88.0, temp: 36.5, rr: 26, muac: 16.2, motherGuardian: "Maria Luisa Aquino", contact: "0917-245-8871", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV", "MCV1", "MCV2"] },
      { code: "NKT-C-002", name: "Kian Rafael De Guzman", type: "Child", sex: "Male", address: "Blk 1 Lot 6, Purok Calachuchi", birthDate: "2025-12-02", lastVisitDate: "2026-05-02", nextVisitDate: "2026-09-08", weight: 9.3, height: 74.0, temp: 36.6, rr: 30, muac: 14.2, motherGuardian: "Sheila Mae Bernardo", contact: "0918-332-4410", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV", "MCV1"] },
      { code: "NKT-C-003", name: "Zia Mae Salvacion", type: "Child", sex: "Female", address: "Blk 2 Lot 1, Purok Calachuchi", birthDate: "2026-05-20", lastVisitDate: "2026-07-25", nextVisitDate: "2026-09-25", weight: 6.8, height: 62.0, temp: 36.8, rr: 34, muac: 13.1, motherGuardian: "Evelyn Rose Dagohoy", contact: "0917-556-2014", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV"] },
      { code: "NKT-C-004", name: "Marcus Levi Palencia", type: "Child", sex: "Male", address: "Blk 2 Lot 5, Purok Calachuchi", birthDate: "2025-02-28", lastVisitDate: "2026-09-10", nextVisitDate: "2026-11-10", weight: 11.2, height: 84.0, temp: 36.4, rr: 27, muac: 15.8, motherGuardian: "Fe Corazon Lumibao", contact: "0919-118-7732", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV", "MCV1", "MCV2"] },
      { code: "NKT-C-005", name: "Ynez Claire Monteverde", type: "Child", sex: "Female", address: "Blk 3 Lot 2, Purok Calachuchi", birthDate: "2026-08-12", lastVisitDate: "2026-09-02", nextVisitDate: "2026-09-02", weight: 5.1, height: 54.0, temp: 36.9, rr: 38, muac: 12.4, motherGuardian: "Rowena Faith Daganta", contact: "0915-809-3345", vaccines: ["BCG", "OPV"] },
      { code: "NKT-M-001", name: "Maria Luisa Aquino", type: "Mother", address: "Blk 1 Lot 5, Purok Calachuchi", birthDate: "1995-03-20", lastVisitDate: "2026-08-01", nextVisitDate: "2026-10-01", weight: 62.4, bp: "110/70", pr: 78, temp: 36.6, ttDose: "TT 2", iron: true },
      { code: "NKT-M-002", name: "Sheila Mae Bernardo", type: "Mother", address: "Blk 3 Lot 2, Purok Calachuchi", birthDate: "1993-07-12", lastVisitDate: "2026-06-20", nextVisitDate: "2026-09-05", weight: 58.9, bp: "120/80", pr: 82, temp: 37.0, ttDose: "TT 3", iron: true },
      { code: "NKT-M-003", name: "Evelyn Rose Dagohoy", type: "Mother", address: "Blk 2 Lot 3, Purok Calachuchi", birthDate: "1997-10-02", lastVisitDate: "2026-08-15", nextVisitDate: "2026-09-19", weight: 66.3, bp: "115/75", pr: 76, temp: 36.5, ttDose: "TT 1", iron: false },
      { code: "NKT-M-004", name: "Fe Corazon Lumibao", type: "Mother", address: "Blk 2 Lot 7, Purok Calachuchi", birthDate: "1990-01-28", lastVisitDate: "2026-10-01", nextVisitDate: "2026-12-01", weight: 70.5, bp: "110/70", pr: 80, temp: 36.7, ttDose: "TT 5", iron: false },
      { code: "NKT-M-005", name: "Rowena Faith Daganta", type: "Mother", address: "Blk 3 Lot 4, Purok Calachuchi", birthDate: "1998-05-16", lastVisitDate: "2026-08-25", nextVisitDate: "2026-09-28", weight: 61.8, bp: "128/84", pr: 84, temp: 36.8, ttDose: "TT 4", iron: true }
    ]
  },
  bougainvillea: {
    name: "Bougainvillea",
    households: 12,
    bhws: "Virginia A. Escorial",
    bhwCount: 1,
    records: [
      { code: "NKT-C-006", name: "Liam Gabriel Santos", type: "Child", sex: "Male", address: "Phase 1 Lot 4, Purok Bougainvillea", birthDate: "2025-01-10", lastVisitDate: "2026-09-10", nextVisitDate: "2026-10-12", weight: 12.6, height: 90.0, temp: 36.4, rr: 25, muac: 16.0, motherGuardian: "Jennifer Anne Pascual", contact: "0917-402-1190", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV", "MCV1", "MCV2"] },
      { code: "NKT-C-007", name: "Camille Faith Garcia", type: "Child", sex: "Female", address: "Phase 2 Lot 1, Purok Bougainvillea", birthDate: "2025-03-05", lastVisitDate: "2026-11-05", nextVisitDate: "2026-12-05", weight: 11.5, height: 86.0, temp: 36.6, rr: 27, muac: 15.6, motherGuardian: "Jocelyn Dalisay Duque", contact: "0918-633-2201", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV", "MCV1", "MCV2"] },
      { code: "NKT-C-008", name: "Jhonna Marie Sales", type: "Child", sex: "Female", address: "Phase 2 Lot 4, Purok Bougainvillea", birthDate: "2026-01-22", lastVisitDate: "2026-07-28", nextVisitDate: "2026-09-30", weight: 7.9, height: 69.0, temp: 36.7, rr: 32, muac: 13.8, motherGuardian: "Marites Jandusay Bengco", contact: "0915-772-3341", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV"] },
      { code: "NKT-C-009", name: "Nathaniel Cipriano", type: "Child", sex: "Male", address: "Phase 3 Lot 2, Purok Bougainvillea", birthDate: "2024-08-14", lastVisitDate: "2026-10-20", nextVisitDate: "2026-11-20", weight: 13.4, height: 94.0, temp: 36.5, rr: 24, muac: 16.4, motherGuardian: "Glenda Rose Villarico", contact: "0919-044-7718", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV", "MCV1", "MCV2"] },
      { code: "NKT-C-010", name: "Aira Belle Manansala", type: "Child", sex: "Female", address: "Phase 3 Lot 5, Purok Bougainvillea", birthDate: "2026-06-09", lastVisitDate: "2026-08-06", nextVisitDate: "2026-09-06", weight: 6.2, height: 59.0, temp: 36.9, rr: 35, muac: 12.9, motherGuardian: "Noralyn Espina Cabig", contact: "0917-883-0067", vaccines: ["BCG", "OPV", "IPV"] },
      { code: "NKT-M-006", name: "Jennifer Anne Pascual", type: "Mother", address: "Phase 1 Lot 8, Purok Bougainvillea", birthDate: "1991-05-08", lastVisitDate: "2026-10-05", nextVisitDate: "2026-11-05", weight: 70.1, bp: "130/85", pr: 88, temp: 37.0, ttDose: "TT 4", iron: false },
      { code: "NKT-M-007", name: "Jocelyn Dalisay Duque", type: "Mother", address: "Phase 1 Lot 10, Purok Bougainvillea", birthDate: "1994-12-19", lastVisitDate: "2026-08-22", nextVisitDate: "2026-09-22", weight: 59.2, bp: "110/70", pr: 74, temp: 36.5, ttDose: "TT 2", iron: true },
      { code: "NKT-M-008", name: "Marites Jandusay Bengco", type: "Mother", address: "Phase 2 Lot 6, Purok Bougainvillea", birthDate: "1996-02-11", lastVisitDate: "2026-07-25", nextVisitDate: "2026-08-25", weight: 63.7, bp: "118/78", pr: 79, temp: 36.6, ttDose: "TT 1", iron: true },
      { code: "NKT-M-009", name: "Glenda Rose Villarico", type: "Mother", address: "Phase 3 Lot 3, Purok Bougainvillea", birthDate: "1989-09-04", lastVisitDate: "2026-09-25", nextVisitDate: "2026-10-25", weight: 68.9, bp: "122/80", pr: 81, temp: 36.7, ttDose: "TT 5", iron: false },
      { code: "NKT-M-010", name: "Noralyn Espina Cabig", type: "Mother", address: "Phase 3 Lot 7, Purok Bougainvillea", birthDate: "1999-06-27", lastVisitDate: "2026-08-16", nextVisitDate: "2026-09-16", weight: 55.8, bp: "110/70", pr: 77, temp: 36.4, ttDose: "TT 1", iron: true }
    ]
  },
  walingwaling: {
    name: "Walingwaling",
    households: 16,
    bhws: "Rosalie E. Villarin · Jessie A. Pia",
    bhwCount: 2,
    records: [
      { code: "NKT-C-011", name: "Sofia Marie Reyes", type: "Child", sex: "Female", address: "Sitio 1 Blk A, Purok Walingwaling", birthDate: "2026-02-25", lastVisitDate: "2026-07-28", nextVisitDate: "2026-08-28", weight: 7.4, height: 67.0, temp: 36.8, rr: 31, muac: 13.6, motherGuardian: "Rosario Blanca Torres", contact: "0917-301-5587", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV"] },
      { code: "NKT-C-012", name: "Rafael Cruz Mendoza", type: "Child", sex: "Male", address: "Sitio 2 Blk B, Purok Walingwaling", birthDate: "2026-04-10", lastVisitDate: "2026-08-20", nextVisitDate: "2026-09-20", weight: 6.9, height: 63.0, temp: 36.6, rr: 33, muac: 13.3, motherGuardian: "Merlinda Avenido Pahayahay", contact: "0918-118-9924", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV"] },
      { code: "NKT-C-013", name: "Hannah Mae Lagrimas", type: "Child", sex: "Female", address: "Sitio 1 Blk D, Purok Walingwaling", birthDate: "2025-08-20", lastVisitDate: "2026-07-15", nextVisitDate: "2026-08-15", weight: 9.8, height: 76.0, temp: 36.7, rr: 29, muac: 14.5, motherGuardian: "Clarissa Joy Maturan", contact: "0915-447-8820", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV", "MCV1"] },
      { code: "NKT-C-014", name: "Ezekiel Domingo Rabanes", type: "Child", sex: "Male", address: "Sitio 2 Blk C, Purok Walingwaling", birthDate: "2025-11-30", lastVisitDate: "2026-08-22", nextVisitDate: "2026-09-22", weight: 8.7, height: 72.0, temp: 36.5, rr: 30, muac: 14.1, motherGuardian: "Divina Gracia Saladino", contact: "0919-722-6641", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV", "MCV1"] },
      { code: "NKT-C-015", name: "Leanne Margaux Tupas", type: "Child", sex: "Female", address: "Sitio 3 Blk A, Purok Walingwaling", birthDate: "2025-05-16", lastVisitDate: "2026-09-18", nextVisitDate: "2026-10-18", weight: 10.6, height: 82.0, temp: 36.4, rr: 28, muac: 15.2, motherGuardian: "Annalee F. Delgado", contact: "0917-660-3145", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV", "MCV1", "MCV2"] },
      { code: "NKT-M-011", name: "Rosario Blanca Torres", type: "Mother", address: "Sitio 1 Blk C, Purok Walingwaling", birthDate: "1994-09-14", lastVisitDate: "2026-10-15", nextVisitDate: "2026-11-15", weight: 64.8, bp: "112/72", pr: 79, temp: 36.5, ttDose: "TT 3", iron: true },
      { code: "NKT-M-012", name: "Merlinda Avenido Pahayahay", type: "Mother", address: "Sitio 2 Blk A, Purok Walingwaling", birthDate: "1992-04-03", lastVisitDate: "2026-07-08", nextVisitDate: "2026-09-08", weight: 71.3, bp: "135/88", pr: 90, temp: 37.1, ttDose: "TT 2", iron: false },
      { code: "NKT-M-013", name: "Clarissa Joy Maturan", type: "Mother", address: "Sitio 1 Blk E, Purok Walingwaling", birthDate: "1997-08-25", lastVisitDate: "2026-08-26", nextVisitDate: "2026-09-26", weight: 57.4, bp: "108/68", pr: 75, temp: 36.6, ttDose: "TT 1", iron: true },
      { code: "NKT-M-014", name: "Divina Gracia Saladino", type: "Mother", address: "Sitio 2 Blk D, Purok Walingwaling", birthDate: "1990-11-17", lastVisitDate: "2026-11-15", nextVisitDate: "2026-12-15", weight: 69.0, bp: "120/80", pr: 82, temp: 36.7, ttDose: "TT 5", iron: false },
      { code: "NKT-M-015", name: "Annalee F. Delgado", type: "Mother", address: "Sitio 3 Blk B, Purok Walingwaling", birthDate: "2001-04-20", lastVisitDate: "2026-08-20", nextVisitDate: "2026-09-20", weight: 53.6, bp: "110/70", pr: 78, temp: 36.4, ttDose: "TT 1", iron: true }
    ]
  },
  sampaguita: {
    name: "Sampaguita",
    households: 11,
    bhws: "Rosevilla A. Siarez",
    bhwCount: 1,
    records: [
      { code: "NKT-C-016", name: "Ethan James Fernandez", type: "Child", sex: "Male", address: "Lot 9 Blk 3, Purok Sampaguita", birthDate: "2024-12-20", lastVisitDate: "2026-10-25", nextVisitDate: "2026-11-25", weight: 12.9, height: 91.0, temp: 36.5, rr: 25, muac: 16.1, motherGuardian: "Cristina Mae Navarro", contact: "0917-413-2210", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV", "MCV1", "MCV2"] },
      { code: "NKT-C-017", name: "Ashlyn Kate Dizon", type: "Child", sex: "Female", address: "Lot 10 Blk 1, Purok Sampaguita", birthDate: "2024-10-05", lastVisitDate: "2026-09-08", nextVisitDate: "2026-10-08", weight: 13.1, height: 92.0, temp: 36.6, rr: 24, muac: 16.3, motherGuardian: "Janice Marie Quibranza", contact: "0918-552-6630", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV", "MCV1", "MCV2"] },
      { code: "NKT-C-018", name: "Gabriel Tristan Umali", type: "Child", sex: "Male", address: "Lot 11 Blk 2, Purok Sampaguita", birthDate: "2025-03-02", lastVisitDate: "2026-08-27", nextVisitDate: "2026-09-27", weight: 11.1, height: 83.0, temp: 36.7, rr: 27, muac: 15.7, motherGuardian: "Rhea Angela Gamboa", contact: "0915-339-8450", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV", "MCV1", "MCV2"] },
      { code: "NKT-C-019", name: "Serena Faith Villafuerte", type: "Child", sex: "Female", address: "Lot 12 Blk 3, Purok Sampaguita", birthDate: "2025-02-12", lastVisitDate: "2026-09-09", nextVisitDate: "2026-09-09", weight: 10.9, height: 82.0, temp: 36.4, rr: 28, muac: 15.5, motherGuardian: "Catherine Joy Panaguiton", contact: "0919-908-1147", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV", "MCV1", "MCV2"] },
      { code: "NKT-C-020", name: "Cayson Liam Del Rosario", type: "Child", sex: "Male", address: "Lot 13 Blk 1, Purok Sampaguita", birthDate: "2026-07-01", lastVisitDate: "2026-08-22", nextVisitDate: "2026-08-22", weight: 5.9, height: 57.0, temp: 36.9, rr: 36, muac: 12.7, motherGuardian: "Imelda Rose Carumba", contact: "0917-270-5691", vaccines: ["BCG", "OPV", "IPV"] },
      { code: "NKT-M-016", name: "Cristina Mae Navarro", type: "Mother", address: "Lot 12 Blk 1, Purok Sampaguita", birthDate: "1997-01-22", lastVisitDate: "2026-09-10", nextVisitDate: "2026-10-10", weight: 61.0, bp: "114/74", pr: 78, temp: 36.6, ttDose: "TT 2", iron: true },
      { code: "NKT-M-017", name: "Janice Marie Quibranza", type: "Mother", address: "Lot 10 Blk 2, Purok Sampaguita", birthDate: "1993-12-08", lastVisitDate: "2026-07-20", nextVisitDate: "2026-08-20", weight: 67.7, bp: "128/84", pr: 85, temp: 36.9, ttDose: "TT 4", iron: true },
      { code: "NKT-M-018", name: "Rhea Angela Gamboa", type: "Mother", address: "Lot 11 Blk 1, Purok Sampaguita", birthDate: "1995-06-30", lastVisitDate: "2026-08-23", nextVisitDate: "2026-09-23", weight: 59.5, bp: "110/70", pr: 76, temp: 36.5, ttDose: "TT 3", iron: false },
      { code: "NKT-M-019", name: "Catherine Joy Panaguiton", type: "Mother", address: "Lot 12 Blk 4, Purok Sampaguita", birthDate: "1991-10-12", lastVisitDate: "2026-10-30", nextVisitDate: "2026-11-30", weight: 70.2, bp: "121/79", pr: 83, temp: 36.7, ttDose: "TT 5", iron: false },
      { code: "NKT-M-020", name: "Imelda Rose Carumba", type: "Mother", address: "Lot 13 Blk 4, Purok Sampaguita", birthDate: "2000-03-15", lastVisitDate: "2026-08-25", nextVisitDate: "2026-09-25", weight: 54.3, bp: "108/68", pr: 74, temp: 36.4, ttDose: "TT 1", iron: true }
    ]
  },
  santan: {
    name: "Santan",
    households: 13,
    bhws: "Margarita G. Millan",
    bhwCount: 1,
    records: [
      { code: "NKT-C-021", name: "Isabella Rose Villanueva", type: "Child", sex: "Female", address: "Blk 5 Lot 2, Purok Santan", birthDate: "2026-05-30", lastVisitDate: "2026-08-05", nextVisitDate: "2026-09-05", weight: 6.6, height: 61.0, temp: 36.8, rr: 33, muac: 13.0, motherGuardian: "Analiza Joy Soriano", contact: "0917-515-8840", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV"] },
      { code: "NKT-C-022", name: "Mikaela Bianca Arceo", type: "Child", sex: "Female", address: "Blk 5 Lot 4, Purok Santan", birthDate: "2026-08-01", lastVisitDate: "2026-08-26", nextVisitDate: "2026-09-26", weight: 5.3, height: 55.0, temp: 36.9, rr: 37, muac: 12.5, motherGuardian: "Daisy May Tuyogon", contact: "0918-671-2049", vaccines: ["BCG", "OPV"] },
      { code: "NKT-C-023", name: "Prince Andrei Lachica", type: "Child", sex: "Male", address: "Blk 5 Lot 6, Purok Santan", birthDate: "2026-06-18", lastVisitDate: "2026-08-30", nextVisitDate: "2026-08-30", weight: 6.1, height: 58.0, temp: 37.0, rr: 35, muac: 12.8, motherGuardian: "Liza Marie Bonganciso", contact: "0915-284-7713", vaccines: ["BCG", "OPV", "IPV"] },
      { code: "NKT-C-024", name: "Shania Cole Arbiol", type: "Child", sex: "Female", address: "Blk 6 Lot 1, Purok Santan", birthDate: "2026-07-22", lastVisitDate: "2026-08-24", nextVisitDate: "2026-09-24", weight: 5.6, height: 56.0, temp: 36.7, rr: 36, muac: 12.6, motherGuardian: "Marife G. Tulio", contact: "0919-437-6021", vaccines: ["BCG", "OPV"] },
      { code: "NKT-C-025", name: "Xander Kyle Bustamante", type: "Child", sex: "Male", address: "Blk 6 Lot 3, Purok Santan", birthDate: "2026-09-01", lastVisitDate: "2026-09-10", nextVisitDate: "2026-09-30", weight: 4.8, height: 51.0, temp: 36.9, rr: 40, muac: 11.9, motherGuardian: "Babylyn Nacion", contact: "0917-883-5510", vaccines: ["BCG"] },
      { code: "NKT-M-021", name: "Analiza Joy Soriano", type: "Mother", address: "Blk 5 Lot 6, Purok Santan", birthDate: "1999-11-03", lastVisitDate: "2026-07-03", nextVisitDate: "2026-09-03", weight: 58.6, bp: "116/76", pr: 79, temp: 36.6, ttDose: "TT 2", iron: true },
      { code: "NKT-M-022", name: "Daisy May Tuyogon", type: "Mother", address: "Blk 5 Lot 5, Purok Santan", birthDate: "1992-02-14", lastVisitDate: "2026-11-08", nextVisitDate: "2026-12-08", weight: 66.4, bp: "124/82", pr: 84, temp: 36.8, ttDose: "TT 4", iron: false },
      { code: "NKT-M-023", name: "Liza Marie Bonganciso", type: "Mother", address: "Blk 5 Lot 7, Purok Santan", birthDate: "1996-07-21", lastVisitDate: "2026-08-18", nextVisitDate: "2026-09-18", weight: 64.1, bp: "118/78", pr: 80, temp: 36.5, ttDose: "TT 3", iron: true },
      { code: "NKT-M-024", name: "Marife G. Tulio", type: "Mother", address: "Blk 6 Lot 2, Purok Santan", birthDate: "1989-05-30", lastVisitDate: "2026-09-30", nextVisitDate: "2026-10-30", weight: 72.0, bp: "132/86", pr: 89, temp: 37.0, ttDose: "TT 5", iron: false },
      { code: "NKT-M-025", name: "Babylyn Nacion", type: "Mother", address: "Blk 6 Lot 4, Purok Santan", birthDate: "2001-01-09", lastVisitDate: "2026-07-26", nextVisitDate: "2026-08-26", weight: 52.9, bp: "108/68", pr: 75, temp: 36.4, ttDose: "TT 1", iron: true }
    ]
  },
  rose: {
    name: "Rose",
    households: 10,
    bhws: "Bernardita T. Caduada",
    bhwCount: 1,
    records: [
      { code: "NKT-C-026", name: "Noah David Ramos", type: "Child", sex: "Male", address: "Lot 3 Blk 2, Purok Rose", birthDate: "2024-11-08", lastVisitDate: "2026-11-10", nextVisitDate: "2026-12-10", weight: 13.2, height: 93.0, temp: 36.4, rr: 24, muac: 16.5, motherGuardian: "Lorelai Dawn Magno", contact: "0917-614-9320", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV", "MCV1", "MCV2"] },
      { code: "NKT-C-027", name: "Kassy Ysabel Lim", type: "Child", sex: "Female", address: "Lot 4 Blk 1, Purok Rose", birthDate: "2025-01-25", lastVisitDate: "2026-09-15", nextVisitDate: "2026-10-15", weight: 12.2, height: 88.0, temp: 36.6, rr: 26, muac: 16.0, motherGuardian: "Edith Claveria Oliva", contact: "0918-209-4451", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV", "MCV1", "MCV2"] },
      { code: "NKT-C-028", name: "Miles Adrian Natividad", type: "Child", sex: "Male", address: "Lot 5 Blk 2, Purok Rose", birthDate: "2024-09-30", lastVisitDate: "2026-10-12", nextVisitDate: "2026-11-12", weight: 13.6, height: 95.0, temp: 36.5, rr: 25, muac: 16.6, motherGuardian: "Grace Ann Pelenio", contact: "0915-771-2083", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV", "MCV1", "MCV2"] },
      { code: "NKT-C-029", name: "Precious Gail Mier", type: "Child", sex: "Female", address: "Lot 6 Blk 1, Purok Rose", birthDate: "2025-04-14", lastVisitDate: "2026-08-28", nextVisitDate: "2026-09-28", weight: 11.8, height: 85.0, temp: 36.7, rr: 27, muac: 15.9, motherGuardian: "Sheryl Mae Quinones", contact: "0919-336-8904", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV", "MCV1", "MCV2"] },
      { code: "NKT-C-030", name: "Jiro Ken Flores", type: "Child", sex: "Male", address: "Lot 7 Blk 2, Purok Rose", birthDate: "2025-06-02", lastVisitDate: "2026-08-04", nextVisitDate: "2026-09-04", weight: 10.8, height: 80.0, temp: 36.8, rr: 28, muac: 15.4, motherGuardian: "Novalyn C. Traya", contact: "0917-948-2276", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV", "MCV1", "MCV2"] },
      { code: "NKT-M-026", name: "Lorelai Dawn Magno", type: "Mother", address: "Lot 7 Blk 1, Purok Rose", birthDate: "1996-06-28", lastVisitDate: "2026-10-18", nextVisitDate: "2026-11-18", weight: 63.5, bp: "112/72", pr: 78, temp: 36.5, ttDose: "TT 3", iron: true },
      { code: "NKT-M-027", name: "Edith Claveria Oliva", type: "Mother", address: "Lot 4 Blk 2, Purok Rose", birthDate: "1995-04-19", lastVisitDate: "2026-08-17", nextVisitDate: "2026-09-17", weight: 60.8, bp: "116/76", pr: 80, temp: 36.6, ttDose: "TT 2", iron: true },
      { code: "NKT-M-028", name: "Grace Ann Pelenio", type: "Mother", address: "Lot 5 Blk 1, Purok Rose", birthDate: "1988-12-25", lastVisitDate: "2026-09-05", nextVisitDate: "2026-10-05", weight: 71.8, bp: "128/84", pr: 87, temp: 36.9, ttDose: "TT 5", iron: false },
      { code: "NKT-M-029", name: "Sheryl Mae Quinones", type: "Mother", address: "Lot 6 Blk 2, Purok Rose", birthDate: "1998-10-08", lastVisitDate: "2026-08-07", nextVisitDate: "2026-09-07", weight: 56.7, bp: "110/70", pr: 76, temp: 36.4, ttDose: "TT 1", iron: true },
      { code: "NKT-M-030", name: "Novalyn C. Traya", type: "Mother", address: "Lot 7 Blk 4, Purok Rose", birthDate: "1997-02-23", lastVisitDate: "2026-08-29", nextVisitDate: "2026-09-29", weight: 59.9, bp: "118/78", pr: 82, temp: 36.7, ttDose: "TT 2", iron: false }
    ]
  },
  daisy: {
    name: "Daisy",
    households: 15,
    bhws: "Prelin L. Veriño · Flora L. Tangoan",
    bhwCount: 2,
    records: [
      { code: "NKT-C-031", name: "Mia Joy Castillo", type: "Child", sex: "Female", address: "Phase A Lot 5, Purok Daisy", birthDate: "2026-03-15", lastVisitDate: "2026-08-21", nextVisitDate: "2026-09-21", weight: 7.2, height: 65.0, temp: 36.7, rr: 32, muac: 13.5, motherGuardian: "Patricia Grace Ocampo", contact: "0917-335-9102", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV"] },
      { code: "NKT-C-032", name: "Adrian Kyle Tobias", type: "Child", sex: "Male", address: "Phase A Lot 7, Purok Daisy", birthDate: "2025-09-10", lastVisitDate: "2026-07-18", nextVisitDate: "2026-08-18", weight: 10.1, height: 78.0, temp: 36.8, rr: 29, muac: 14.6, motherGuardian: "Tereza Mae Ballesteros", contact: "0918-480-2273", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV", "MCV1"] },
      { code: "NKT-C-033", name: "Reign Ashley Julian", type: "Child", sex: "Female", address: "Phase B Lot 2, Purok Daisy", birthDate: "2025-04-22", lastVisitDate: "2026-09-22", nextVisitDate: "2026-10-22", weight: 11.6, height: 84.0, temp: 36.5, rr: 27, muac: 15.8, motherGuardian: "Yvonne Claire Enopia", contact: "0915-660-9814", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV", "MCV1", "MCV2"] },
      { code: "NKT-C-034", name: "Jethro Andrei Salas", type: "Child", sex: "Male", address: "Phase B Lot 5, Purok Daisy", birthDate: "2026-05-11", lastVisitDate: "2026-08-29", nextVisitDate: "2026-09-29", weight: 6.9, height: 63.0, temp: 36.9, rr: 34, muac: 13.2, motherGuardian: "Genalyn V. Sindol", contact: "0917-813-5607", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV"] },
      { code: "NKT-C-035", name: "Bonnie Marie Alvarico", type: "Child", sex: "Female", address: "Phase B Lot 7, Purok Daisy", birthDate: "2025-03-19", lastVisitDate: "2026-10-15", nextVisitDate: "2026-11-15", weight: 12.0, height: 87.0, temp: 36.4, rr: 26, muac: 16.0, motherGuardian: "Ma. Kristine Pasco", contact: "0919-224-8736", vaccines: ["BCG", "OPV", "IPV", "PENTA", "PCV", "MCV1", "MCV2"] },
      { code: "NKT-M-031", name: "Patricia Grace Ocampo", type: "Mother", address: "Phase A Lot 9, Purok Daisy", birthDate: "1992-08-19", lastVisitDate: "2026-07-12", nextVisitDate: "2026-08-12", weight: 65.2, bp: "120/80", pr: 81, temp: 36.6, ttDose: "TT 3", iron: true },
      { code: "NKT-M-032", name: "Tereza Mae Ballesteros", type: "Mother", address: "Phase A Lot 10, Purok Daisy", birthDate: "1994-03-27", lastVisitDate: "2026-10-08", nextVisitDate: "2026-11-08", weight: 67.3, bp: "114/74", pr: 78, temp: 36.5, ttDose: "TT 4", iron: false },
      { code: "NKT-M-033", name: "Yvonne Claire Enopia", type: "Mother", address: "Phase B Lot 3, Purok Daisy", birthDate: "1996-09-11", lastVisitDate: "2026-08-24", nextVisitDate: "2026-09-24", weight: 62.1, bp: "118/78", pr: 80, temp: 36.7, ttDose: "TT 2", iron: true },
      { code: "NKT-M-034", name: "Genalyn V. Sindol", type: "Mother", address: "Phase B Lot 6, Purok Daisy", birthDate: "1990-07-07", lastVisitDate: "2026-09-20", nextVisitDate: "2026-10-20", weight: 70.9, bp: "130/85", pr: 88, temp: 36.9, ttDose: "TT 5", iron: false },
      { code: "NKT-M-035", name: "Ma. Kristine Pasco", type: "Mother", address: "Phase B Lot 8, Purok Daisy", birthDate: "1998-12-01", lastVisitDate: "2026-08-28", nextVisitDate: "2026-09-28", weight: 57.8, bp: "110/70", pr: 79, temp: 36.4, ttDose: "TT 1", iron: true }
    ]
  }
};

// GET ALL PUROK RECORDS FLATTENED (for analytics)
function getAllPurokRecords() {
  const allRecords = [];
  Object.keys(purokData).forEach(key => {
    const purok = purokData[key];
    purok.records.forEach(rec => {
      rec.status = computeStatus(rec.nextVisitDate, rec.lastVisitDate);
      allRecords.push({ ...rec, purok: purok.name, purokKey: key });
    });
  });
  return allRecords;
}