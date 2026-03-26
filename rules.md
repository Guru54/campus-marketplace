# 📘 Project Rules (Rezell)

## 1️⃣ Architecture Rules

* Follow Feature-Based Architecture.
* Each feature must live inside `/features`.
* Shared components go inside `/shared/components`.
* API logic must NOT be written directly inside UI components.
* Business logic must be inside hooks or service files.

---i

## 2️⃣ File Naming Rules

* Components → PascalCase (Example: `ListingCard.jsx`)
* Hooks → camelCase starting with `use` (Example: `useListings.js`)
* API files → `featureName.api.js`
* Utils → camelCase
* Feature folders → lowercase

---

## 3️⃣ Component Rules

* Keep components small and reusable.
* Avoid writing large components (max ~300 lines).
* Extract logic into custom hooks when needed.
* Handle loading and error states properly.

---

## 4️⃣ API Rules

* All API calls must use `/shared/services/api.js`.
* No direct axios usage inside components.
* Always handle errors using try/catch.
* Show user-friendly error messages.

---

## 5️⃣ State Management Rules

* Use local state for UI logic.
* Use Context only for global data (auth, theme, socket).
* Avoid unnecessary prop drilling.

---

## 6️⃣ Styling Rules

* Use TailwindCSS.
* Avoid inline styles.
* Maintain consistent spacing.
* Support dark mode compatibility.

---

## 7️⃣ Git Rules

Use meaningful commit messages:

feat: add listing filter
fix: resolve chat socket issue
refactor: move API logic to service layer

---

## 8️⃣ Clean Code Rules

* No unused variables.
* No console logs in production.
* Use meaningful variable names.
* Always handle edge cases.

---

##

This project must remain:

* Modular
* Scalable
* Clean
* Production-ready

