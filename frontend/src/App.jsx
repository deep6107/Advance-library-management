import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Heart,
  Plus,
  UserRound,
  GraduationCap,
  Library,
  Users,
  X,
  ArrowRight,
  Search,
  LogOut,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  BookMarked,
  Wallet,
  ClipboardList,
  Clock,
  ShieldCheck
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message || "Something went wrong.";

    throw new Error(message);
  }

  return data;
}

function App() {
  const [page, setPage] = useState("home");

  const [requests, setRequests] = useState([]);
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [librarians, setLibrarians] = useState([]);
  const [issueRequests, setIssueRequests] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [bookTransactions, setBookTransactions] = useState([]);

  const [showLogin, setShowLogin] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [role, setRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    try {
      const [
        requestData,
        bookData,
        studentData,
        teacherData,
        librarianData,
        issueData,
        transactionData,
        bookTransactionData
      ] = await Promise.all([
        api("/api/public-requests"),
        api("/api/books"),
        api("/api/students"),
        api("/api/teachers"),
        api("/api/librarians"),
        api("/api/issue-requests"),
        api("/api/transactions"),
        api("/api/book-transactions")
      ]);

      setRequests(requestData || []);
      setBooks(bookData || []);
      setStudents(studentData || []);
      setTeachers(teacherData || []);
      setLibrarians(librarianData || []);
      setIssueRequests(issueData || []);
      setTransactions(transactionData || []);
      setBookTransactions(bookTransactionData || []);

      if (currentUser) {
        const source =
          role === "student"
            ? studentData
            : role === "teacher"
              ? teacherData
              : librarianData;

        const refreshed = source?.find(
          (item) => Number(item.id) === Number(currentUser.id)
        );

        if (refreshed) {
          setCurrentUser(refreshed);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const likeRequest = async (id) => {
    try {
      const updated = await api(
        `/api/public-requests/${id}/like`,
        { method: "PUT" }
      );

      setRequests((current) =>
        current.map((request) =>
          request.id === id ? updated : request
        )
      );
    } catch (error) {
      alert(error.message);
    }
  };

  const openDashboard = (selectedRole, user) => {
    setRole(selectedRole);
    setCurrentUser(user);
    setShowLogin(false);
    setPage("dashboard");
  };

  const logout = () => {
    setRole(null);
    setCurrentUser(null);
    setPage("home");
  };

  const filteredRequests = requests.filter((request) =>
    `${request.bookTitle || ""} ${request.author || ""} ${request.description || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (page === "dashboard" && currentUser) {
    return (
      <Dashboard
        role={role}
        user={currentUser}
        books={books}
        requests={requests}
        issueRequests={issueRequests}
        transactions={transactions}
        bookTransactions={bookTransactions}
        students={students}
        teachers={teachers}
        librarians={librarians}
        reload={loadData}
        logout={logout}
      />
    );
  }

  return (
    <div className="app">

      <header className="navbar">
        <div className="brand">
          <div className="brand-mark">
            <BookOpen size={23} strokeWidth={1.8} />
          </div>

          <div>
            <div className="brand-name">The Library</div>
            <div className="brand-subtitle">
              KNOWLEDGE • COMMUNITY • DISCOVERY
            </div>
          </div>
        </div>

        <button
          className="login-button"
          onClick={() => setShowLogin(true)}
        >
          <UserRound size={17} />
          Login
        </button>
      </header>

      <main>

        <section className="hero">
          <div className="hero-content">

            <div className="eyebrow">
              <BookOpen size={15} />
              YOUR COMMUNITY LIBRARY
            </div>

            <h1>
              Every book has
              <br />
              <em>a story waiting.</em>
            </h1>

            <p>
              Discover books, share what you want to read,
              and help shape the collection together.
            </p>

            <div className="hero-actions">
              <button
                className="primary-button"
                onClick={() => setShowRequest(true)}
              >
                Request a Book
                <ArrowRight size={17} />
              </button>

              <a href="#collection" className="secondary-button">
                Explore Collection
              </a>
            </div>

          </div>

          <div className="hero-books">
            <div className="book book-one">
              <span>Clean<br />Code</span>
              <small>ROBERT C. MARTIN</small>
            </div>

            <div className="book book-two">
              <span>Effective<br />Java</span>
              <small>JOSHUA BLOCH</small>
            </div>

            <div className="book book-three">
              <span>Read.<br />Learn.<br />Grow.</span>
            </div>

            <div className="shelf"></div>
          </div>
        </section>

        <section className="requests-section">

          <div className="section-heading">
            <div>
              <span className="section-label">FROM OUR READERS</span>
              <h2>What should we add next?</h2>
              <p>
                Students and teachers can suggest books for the library.
                Support a request with a like.
              </p>
            </div>

            <button
              className="outline-button"
              onClick={() => setShowRequest(true)}
            >
              <Plus size={17} />
              Request
            </button>
          </div>

          <div className="search-box">
            <Search size={18} />
            <input
              placeholder="Search book requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="empty-state">
              <BookOpen size={30} />
              <p>Opening the shelves...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={30} />
              <p>No book requests found.</p>
            </div>
          ) : (
            <div className="request-grid">
              {filteredRequests.map((request) => (
                <article className="request-card" key={request.id}>

                  <div className="request-book">
                    <BookOpen size={25} />
                  </div>

                  <div className="request-content">

                    <div className="request-meta">
                      <span>{request.name || "Anonymous"}</span>

                      <span>
                        {request.requestDate
                          ? new Date(request.requestDate).toLocaleDateString()
                          : "Recently"}
                      </span>
                    </div>

                    <h3>{request.bookTitle}</h3>

                    {request.author && (
                      <div className="author">
                        by {request.author}
                      </div>
                    )}

                    {request.description && (
                      <p>{request.description}</p>
                    )}

                    <button
                      className="like-button"
                      onClick={() => likeRequest(request.id)}
                    >
                      <Heart size={17} />
                      <span>{request.likes || 0}</span>
                      <small>
                        {(request.likes || 0) === 1 ? "like" : "likes"}
                      </small>
                    </button>

                  </div>

                </article>
              ))}
            </div>
          )}

        </section>

        <section className="collection-section" id="collection">

          <div className="section-heading">
            <div>
              <span className="section-label">THE COLLECTION</span>
              <h2>Books on our shelves</h2>
              <p>
                A glimpse of what is currently available.
              </p>
            </div>
          </div>

          <div className="bookshelf-grid">
            {books.slice(0, 8).map((book) => (
              <div className="collection-book" key={book.id}>

                <div className="mini-book">
                  <BookOpen size={20} />
                </div>

                <div>
                  <h3>{book.title}</h3>
                  <p>{book.author}</p>

                  <span
                    className={
                      book.availableCopies > 0
                        ? "available"
                        : "unavailable"
                    }
                  >
                    {book.availableCopies > 0
                      ? `${book.availableCopies} available`
                      : "Currently issued"}
                  </span>
                </div>

              </div>
            ))}
          </div>

        </section>

        <section className="quote-section">
          <BookOpen size={35} strokeWidth={1.4} />

          <blockquote>
            “A library is not just a collection of books.
            It is a collection of possibilities.”
          </blockquote>

          <span>— THE LIBRARY</span>
        </section>

      </main>

      <footer>
        <div className="footer-brand">
          <BookOpen size={19} />
          The Library
        </div>

        <span>
          Built for readers, learners & knowledge seekers.
        </span>
      </footer>

      {showLogin && (
        <LoginModal
          students={students}
          teachers={teachers}
          librarians={librarians}
          onClose={() => setShowLogin(false)}
          onLogin={openDashboard}
        />
      )}

      {showRequest && (
        <RequestModal
          onClose={() => setShowRequest(false)}
          onCreated={loadData}
        />
      )}

    </div>
  );
}


/* ================= LOGIN ================= */

function LoginModal({
  students,
  teachers,
  librarians,
  onClose,
  onLogin
}) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const chooseRole = (value) => {
    setSelectedRole(value);
    setUserId("");
    setPassword("");
    setError("");
  };

  const login = () => {
    setError("");

    if (!selectedRole) {
      setError("Please choose your role.");
      return;
    }

    if (!userId.trim() || !password) {
      setError("Enter both ID and password.");
      return;
    }

    const users =
      selectedRole === "student"
        ? students
        : selectedRole === "teacher"
          ? teachers
          : librarians;

    const user = users.find(
      (item) => String(item.id) === String(userId).trim()
    );

    if (!user) {
      setError("No account found with this ID.");
      return;
    }

    if (String(user.password || "") !== password) {
      setError("Incorrect password.");
      return;
    }

    onLogin(selectedRole, user);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>

      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >

        <button className="close-button" onClick={onClose}>
          <X size={19} />
        </button>

        <div className="modal-icon">
          <BookOpen size={24} />
        </div>

        <span className="section-label">
          WELCOME BACK
        </span>

        <h2>Enter the library</h2>

        <p>
          Choose your role and sign in with your library ID.
        </p>

        <div className="role-list">

          <button
            className={
              selectedRole === "student"
                ? "role active"
                : "role"
            }
            onClick={() => chooseRole("student")}
          >
            <div className="role-icon">
              <GraduationCap />
            </div>

            <div>
              <strong>Student</strong>
              <span>Borrow & request books</span>
            </div>

            <ArrowRight size={17} />
          </button>

          <button
            className={
              selectedRole === "teacher"
                ? "role active"
                : "role"
            }
            onClick={() => chooseRole("teacher")}
          >
            <div className="role-icon">
              <Users />
            </div>

            <div>
              <strong>Teacher</strong>
              <span>Borrow & request books</span>
            </div>

            <ArrowRight size={17} />
          </button>

          <button
            className={
              selectedRole === "librarian"
                ? "role active"
                : "role"
            }
            onClick={() => chooseRole("librarian")}
          >
            <div className="role-icon">
              <Library />
            </div>

            <div>
              <strong>Librarian</strong>
              <span>Manage the library</span>
            </div>

            <ArrowRight size={17} />
          </button>

        </div>

        {selectedRole && (
          <>
            <label className="user-select-label">
              Library ID
            </label>

            <input
              className="user-select"
              type="text"
              placeholder={`Enter ${selectedRole} ID`}
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") login();
              }}
            />

            <label className="user-select-label">
              Password
            </label>

            <input
              className="user-select"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") login();
              }}
            />

            {error && (
              <div className="warning-panel">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <button
              className="continue-button"
              onClick={login}
            >
              Sign In
              <ArrowRight size={17} />
            </button>
          </>
        )}

      </div>
    </div>
  );
}


/* ================= DASHBOARD ================= */

function Dashboard({
  role,
  user,
  books,
  requests,
  issueRequests,
  transactions,
  bookTransactions,
  students,
  teachers,
  librarians,
  reload,
  logout
}) {
  const [active, setActive] = useState("overview");

  const displayRole =
    role.charAt(0).toUpperCase() + role.slice(1);

  const navigation =
    role === "librarian"
      ? [
          ["overview", <BookOpen size={18} />, "Overview"],
          ["manage-books", <BookMarked size={18} />, "Manage Books"],
          ["manage-students", <GraduationCap size={18} />, "Manage Students"],
          ["manage-teachers", <Users size={18} />, "Manage Teachers"],
          ["issue-requests", <ClipboardList size={18} />, "Issue Requests"],
          ["returns", <RotateCcw size={18} />, "Returns"],
          ["transactions", <Wallet size={18} />, "Payments"],
          ["public", <Heart size={18} />, "Public Requests"],
          ["profile", <UserRound size={18} />, "Profile"]
        ]
      : [
          ["overview", <BookOpen size={18} />, "Overview"],
          ["books", <BookMarked size={18} />, "Books"],
          ["requests", <ClipboardList size={18} />, "My Requests"],
          ["borrowed", <RotateCcw size={18} />, "Borrowed Books"],
          ["payments", <Wallet size={18} />, "Payments"],
          ["profile", <UserRound size={18} />, "Profile"]
        ];

  return (
    <div className="dashboard">

      <aside className="dashboard-sidebar">

        <div className="dashboard-brand">
          <div className="brand-mark">
            <BookOpen size={22} />
          </div>

          <div>
            <strong>The Library</strong>
            <span>{displayRole} Portal</span>
          </div>
        </div>

        <nav>
          {navigation.map(([key, icon, label]) => (
            <button
              key={key}
              className={active === key ? "nav-active" : ""}
              onClick={() => setActive(key)}
            >
              {icon}
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">

          <div className="logged-user">
            <UserRound size={17} />

            <div>
              <strong>{user.name}</strong>
              <span>{displayRole}</span>
            </div>
          </div>

          <button className="logout-button" onClick={logout}>
            <LogOut size={17} />
            Logout
          </button>

        </div>

      </aside>

      <main className="dashboard-main">

        <header className="dashboard-header">

          <div>
            <span className="section-label">
              {displayRole.toUpperCase()} PORTAL
            </span>

            <h1>
              Good evening, {user.name.split(" ")[0]}.
            </h1>
          </div>

          <button
            className="refresh-button"
            onClick={reload}
          >
            <RotateCcw size={16} />
            Refresh
          </button>

        </header>

        {active === "overview" && (
          <Overview
            role={role}
            user={user}
            books={books}
            issueRequests={issueRequests}
            transactions={transactions}
            bookTransactions={bookTransactions}
          />
        )}

        {active === "books" && (
          <BooksView
            role={role}
            user={user}
            books={books}
            reload={reload}
          />
        )}

        {active === "manage-books" && (
          <ManageBooks
            books={books}
            reload={reload}
          />
        )}

        {active === "manage-students" && (
          <ManageStudents
            students={students}
            reload={reload}
          />
        )}

        {active === "manage-teachers" && (
          <ManageTeachers
            teachers={teachers}
            reload={reload}
          />
        )}

        {active === "requests" && (
          <MyRequests
            role={role}
            user={user}
            issueRequests={issueRequests}
            books={books}
          />
        )}

        {active === "borrowed" && (
          <BorrowedBooks
            role={role}
            user={user}
            bookTransactions={bookTransactions}
            books={books}
          />
        )}

        {active === "payments" && (
          <Payments
            role={role}
            user={user}
            transactions={transactions}
          />
        )}

        {active === "issue-requests" && (
          <IssueRequests
            issueRequests={issueRequests}
            books={books}
            students={students}
            teachers={teachers}
            librarians={librarians}
            librarian={user}
            reload={reload}
          />
        )}

        {active === "returns" && (
          <Returns
            bookTransactions={bookTransactions}
            books={books}
            students={students}
            teachers={teachers}
            reload={reload}
          />
        )}



        {active === "transactions" && (
          <LibrarianPayments
            transactions={transactions}
            students={students}
            teachers={teachers}
            reload={reload}
          />
        )}

        {active === "public" && (
          <PublicRequests
            requests={requests}
            reload={reload}
          />
        )}

        {active === "profile" && (
          <ProfileView
            role={role}
            user={user}
            reload={reload}
          />
        )}

      </main>
    </div>
  );
}


/* ================= OVERVIEW ================= */

function Overview({
  role,
  user,
  books,
  issueRequests,
  transactions,
  bookTransactions
}) {
  const myTransactions = bookTransactions.filter(
    (transaction) =>
      transaction.userType?.toLowerCase() === role &&
      String(transaction.userId) === String(user.id)
  );

  const borrowed = myTransactions.filter(
    (transaction) =>
      transaction.type === "ISSUE" &&
      !transaction.returnDate
  );

  const myRequests = issueRequests.filter(
    (request) =>
      request.userType?.toLowerCase() === role &&
      String(request.userId) === String(user.id)
  );

  if (role === "librarian") {
    const pendingRequests = issueRequests.filter(
      (request) => request.status === "PENDING"
    ).length;

    const activeLoans = bookTransactions.filter(
      (transaction) =>
        transaction.type === "ISSUE" &&
        !transaction.returnDate
    ).length;

    const pendingPayments = transactions.filter(
      (transaction) => transaction.status === "PENDING"
    ).length;

    return (
      <>
        <div className="stat-grid">

          <Stat
            icon={<BookOpen />}
            title="Total Books"
            value={books.length}
          />

          <Stat
            icon={<ClipboardList />}
            title="Pending Requests"
            value={pendingRequests}
          />

          <Stat
            icon={<RotateCcw />}
            title="Active Loans"
            value={activeLoans}
          />

          <Stat
            icon={<Wallet />}
            title="Pending Payments"
            value={pendingPayments}
          />

        </div>

        <div className="dashboard-panel">

          <div className="panel-heading">
            <div>
              <span className="section-label">
                LIBRARIAN CONTROL
              </span>
              <h2>Library at a glance</h2>
            </div>
          </div>

          <div className="quick-grid">

            <QuickItem
              icon={<ClipboardList />}
              title="Issue Requests"
              text={`${pendingRequests} requests waiting for action`}
            />

            <QuickItem
              icon={<RotateCcw />}
              title="Returns"
              text={`${activeLoans} books currently issued`}
            />

            <QuickItem
              icon={<Wallet />}
              title="Payments"
              text={`${pendingPayments} payment requests pending`}
            />

          </div>

        </div>
      </>
    );
  }

  const pendingPayments = transactions.filter(
    (transaction) =>
      transaction.personType?.toLowerCase() === role &&
      String(transaction.personId) === String(user.id) &&
      transaction.status === "PENDING"
  );

  return (
    <>
      <div className="stat-grid">

        <Stat
          icon={<BookOpen />}
          title="Available Books"
          value={books.filter(
            (book) => book.availableCopies > 0
          ).length}
        />

        <Stat
          icon={<BookMarked />}
          title="Currently Borrowed"
          value={borrowed.length}
        />

        <Stat
          icon={<ClipboardList />}
          title="My Requests"
          value={myRequests.length}
        />

        <Stat
          icon={
            role === "student" && user.banned
              ? <AlertCircle />
              : <CheckCircle />
          }
          title="Account"
          value={
            role === "student" && user.banned
              ? "Banned"
              : "Active"
          }
        />

      </div>

      {role === "student" && user.banned && (
        <div className="warning-panel">
          <AlertCircle size={22} />
          <div>
            <strong>Borrowing temporarily suspended.</strong>
            <span>
              Your account is banned until{" "}
              {user.banUntil
                ? new Date(user.banUntil).toLocaleDateString()
                : "the penalty period ends"}
              .
            </span>
          </div>
        </div>
      )}

      {pendingPayments.length > 0 && (
        <div className="warning-panel">
          <Wallet size={22} />
          <div>
            <strong>Payment pending</strong>
            <span>
              You have {pendingPayments.length} pending payment request
              {pendingPayments.length === 1 ? "" : "s"}.
            </span>
          </div>
        </div>
      )}

      <div className="dashboard-panel">

        <div className="panel-heading">
          <div>
            <span className="section-label">
              YOUR LIBRARY
            </span>
            <h2>Welcome back</h2>
          </div>
        </div>

        <div className="quick-grid">

          <QuickItem
            icon={<BookMarked />}
            title="Borrowed Books"
            text={
              borrowed.length
                ? `${borrowed.length} book${borrowed.length === 1 ? "" : "s"} currently with you`
                : "No books currently borrowed"
            }
          />

          <QuickItem
            icon={<ClipboardList />}
            title="Requests"
            text={`${myRequests.length} request${myRequests.length === 1 ? "" : "s"} in your history`}
          />

          <QuickItem
            icon={<ShieldCheck />}
            title="Library Desk"
            text="Returns are handled by the librarian."
          />

        </div>

      </div>
    </>
  );
}


/* ================= BOOKS ================= */

function BooksView({ role, user, books, reload }) {
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  const filteredBooks = useMemo(() => {
    return books.filter((book) =>
      `${book.title || ""} ${book.author || ""} ${book.isbn || ""} ${book.category || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [books, search]);

  const requestBook = async (book) => {
    if (book.availableCopies <= 0) {
      alert("This book is currently unavailable.");
      return;
    }

    setBusyId(book.id);

    try {
      await api(
        `/api/issue-requests?userType=${role.toUpperCase()}&userId=${encodeURIComponent(user.id)}&bookId=${book.id}`,
        { method: "POST" }
      );

      alert(`Request submitted for "${book.title}".`);
      await reload();
    } catch (error) {
      alert(error.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="dashboard-panel">

        <div className="panel-heading">
          <div>
            <span className="section-label">CATALOGUE</span>
            <h2>Browse the shelves</h2>
          </div>
        </div>

        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Search by title, author, ISBN or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredBooks.length === 0 ? (
          <Empty message="No books match your search." />
        ) : (
          <div className="dashboard-book-grid">
            {filteredBooks.map((book) => (
              <div className="dashboard-book-card" key={book.id}>

                <div className="dashboard-book-cover">
                  <BookOpen size={28} />
                </div>

                <div className="dashboard-book-info">
                  <span className="section-label">
                    {book.category || "BOOK"}
                  </span>

                  <h3>{book.title}</h3>

                  <p>{book.author || "Unknown author"}</p>

                  <small>
                    ISBN: {book.isbn || "Not provided"}
                  </small>

                  <div className="book-card-bottom">
                    <span
                      className={
                        book.availableCopies > 0
                          ? "available"
                          : "unavailable"
                      }
                    >
                      {book.availableCopies > 0
                        ? `${book.availableCopies} available`
                        : "Currently issued"}
                    </span>

                    {role !== "librarian" && (
                      <button
                        className="small-action-button"
                        disabled={
                          book.availableCopies <= 0 ||
                          busyId === book.id ||
                          (role === "student" && user.banned)
                        }
                        onClick={() => requestBook(book)}
                      >
                        {busyId === book.id
                          ? "Requesting..."
                          : "Request"}
                      </button>
                    )}
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </>
  );
}


/* ================= MY REQUESTS ================= */

function MyRequests({
  role,
  user,
  issueRequests,
  books
}) {
  const mine = issueRequests
    .filter(
      (request) =>
        request.userType?.toLowerCase() === role &&
        String(request.userId) === String(user.id)
    )
    .sort((a, b) => Number(b.id) - Number(a.id));

  const bookName = (id) =>
    books.find((book) => Number(book.id) === Number(id))?.title ||
    `Book #${id}`;

  return (
    <div className="dashboard-panel">

      <div className="panel-heading">
        <div>
          <span className="section-label">REQUEST HISTORY</span>
          <h2>My book requests</h2>
        </div>
      </div>

      {mine.length === 0 ? (
        <Empty message="You have not requested any books yet." />
      ) : (
        <div className="data-list">
          {mine.map((request) => (
            <div className="data-row" key={request.id}>

              <div>
                <strong>{bookName(request.bookId)}</strong>
                <span>
                  Requested{" "}
                  {request.requestDate
                    ? new Date(request.requestDate).toLocaleDateString()
                    : "recently"}
                </span>
              </div>

              <StatusBadge status={request.status} />

            </div>
          ))}
        </div>
      )}

    </div>
  );
}


/* ================= BORROWED ================= */

function BorrowedBooks({
  role,
  user,
  bookTransactions,
  books
}) {
  const borrowed = bookTransactions.filter(
    (transaction) =>
      transaction.userType?.toLowerCase() === role &&
      String(transaction.userId) === String(user.id) &&
      transaction.type === "ISSUE" &&
      !transaction.returnDate
  );

  const bookName = (id) =>
    books.find((book) => Number(book.id) === Number(id))?.title ||
    `Book #${id}`;

  return (
    <div className="dashboard-panel">

      <div className="panel-heading">
        <div>
          <span className="section-label">CURRENT LOANS</span>
          <h2>Books currently with you</h2>
        </div>
      </div>

      {borrowed.length === 0 ? (
        <Empty message="You have no currently borrowed books." />
      ) : (
        <>
          <div className="data-list">
            {borrowed.map((transaction) => (
              <div className="data-row" key={transaction.id}>

                <div>
                  <strong>{bookName(transaction.bookId)}</strong>

                  <span>
                    Issued:{" "}
                    {transaction.issueDate
                      ? new Date(transaction.issueDate).toLocaleDateString()
                      : "—"}
                  </span>

                  <span>
                    Due:{" "}
                    {transaction.dueDate
                      ? new Date(transaction.dueDate).toLocaleDateString()
                      : "—"}
                  </span>
                </div>

                <span className="status-badge approved">
                  <Clock size={14} />
                  Issued
                </span>

              </div>
            ))}
          </div>

          <div className="warning-panel">
            <RotateCcw size={20} />
            <div>
              <strong>Return at the library desk</strong>
              <span>
                Students and teachers cannot return books themselves.
                Please hand the book to the librarian for processing.
              </span>
            </div>
          </div>
        </>
      )}

    </div>
  );
}


/* ================= USER PAYMENTS ================= */

function Payments({ role, user, transactions }) {
  const mine = transactions
    .filter(
      (transaction) =>
        transaction.personType?.toLowerCase() === role &&
        String(transaction.personId) === String(user.id)
    )
    .sort((a, b) => Number(b.id) - Number(a.id));

  return (
    <div className="dashboard-panel">

      <div className="panel-heading">
        <div>
          <span className="section-label">ACCOUNT</span>
          <h2>Payments & charges</h2>
        </div>
      </div>

      {mine.length === 0 ? (
        <Empty message="No payment records for your account." />
      ) : (
        <div className="data-list">
          {mine.map((transaction) => (
            <div className="data-row" key={transaction.id}>

              <div>
                <strong>
                  {transaction.type?.replaceAll("_", " ")}
                </strong>

                <span>
                  {transaction.description || "Library transaction"}
                </span>

                <span>
                  Amount: ₹{Number(transaction.amount || 0).toFixed(2)}
                </span>

                {transaction.receiptNumber && (
                  <span>
                    Receipt: {transaction.receiptNumber}
                  </span>
                )}
              </div>

              <StatusBadge status={transaction.status} />

            </div>
          ))}
        </div>
      )}

    </div>
  );
}


/* ================= LIBRARIAN ISSUE REQUESTS ================= */

function IssueRequests({
  issueRequests,
  books,
  students,
  teachers,
  librarian,
  reload
}) {
  const [busyId, setBusyId] = useState(null);

  const pending = issueRequests.filter(
    (request) => request.status === "PENDING"
  );

  const approved = issueRequests.filter(
    (request) => request.status === "APPROVED"
  );

  const getPerson = (request) => {
    const source =
      request.userType?.toUpperCase() === "STUDENT"
        ? students
        : teachers;

    return source.find(
      (person) => String(person.id) === String(request.userId)
    );
  };

  const getBook = (request) =>
    books.find(
      (book) => Number(book.id) === Number(request.bookId)
    );

  const updateRequest = async (request, action) => {
    setBusyId(request.id);

    try {
      await api(
        `/api/librarians/${librarian.id}/requests/${request.id}/${action}`,
        { method: "PUT" }
      );

      await reload();
    } catch (error) {
      alert(error.message);
    } finally {
      setBusyId(null);
    }
  };

  const issueBook = async (request) => {
    setBusyId(request.id);

    try {
      await api(
        `/api/book-transactions/issue/${request.id}`,
        { method: "POST" }
      );

      await reload();
    } catch (error) {
      alert(error.message);
    } finally {
      setBusyId(null);
    }
  };

  const RequestRow = ({ request, approvedMode = false }) => {
    const person = getPerson(request);
    const book = getBook(request);

    return (
      <div className="data-row">

        <div>
          <strong>
            {book?.title || `Book #${request.bookId}`}
          </strong>

          <span>
            {request.userType} ·{" "}
            {person?.name || `User #${request.userId}`}
            {" · ID "}
            {request.userId}
          </span>

          <span>
            Requested{" "}
            {request.requestDate
              ? new Date(request.requestDate).toLocaleDateString()
              : "recently"}
          </span>
        </div>

        <div className="row-actions">
          {approvedMode ? (
            <button
              className="small-action-button"
              disabled={busyId === request.id}
              onClick={() => issueBook(request)}
            >
              <BookMarked size={15} />
              {busyId === request.id ? "Issuing..." : "Issue Book"}
            </button>
          ) : (
            <>
              <button
                className="small-action-button"
                disabled={busyId === request.id}
                onClick={() => updateRequest(request, "approve")}
              >
                <CheckCircle size={15} />
                Approve
              </button>

              <button
                className="small-action-button danger"
                disabled={busyId === request.id}
                onClick={() => updateRequest(request, "reject")}
              >
                <X size={15} />
                Reject
              </button>
            </>
          )}
        </div>

      </div>
    );
  };

  return (
    <>
      <div className="dashboard-panel">

        <div className="panel-heading">
          <div>
            <span className="section-label">LIBRARIAN ACTION</span>
            <h2>Pending issue requests</h2>
          </div>
        </div>

        {pending.length === 0 ? (
          <Empty message="No pending issue requests." />
        ) : (
          <div className="data-list">
            {pending.map((request) => (
              <RequestRow
                key={request.id}
                request={request}
              />
            ))}
          </div>
        )}

      </div>

      <div className="dashboard-panel">

        <div className="panel-heading">
          <div>
            <span className="section-label">NEXT STEP</span>
            <h2>Approved — ready to issue</h2>
          </div>
        </div>

        {approved.length === 0 ? (
          <Empty message="No approved requests waiting for issue." />
        ) : (
          <div className="data-list">
            {approved.map((request) => (
              <RequestRow
                key={request.id}
                request={request}
                approvedMode
              />
            ))}
          </div>
        )}

      </div>
    </>
  );
}


/* ================= LIBRARIAN RETURNS ================= */

function Returns({
  bookTransactions,
  books,
  students,
  teachers,
  reload
}) {
  const [busyId, setBusyId] = useState(null);

  const activeLoans = bookTransactions.filter(
    (transaction) =>
      transaction.type === "ISSUE" &&
      !transaction.returnDate
  );

  const getPerson = (transaction) => {
    const source =
      transaction.userType?.toUpperCase() === "STUDENT"
        ? students
        : teachers;

    return source.find(
      (person) =>
        String(person.id) === String(transaction.userId)
    );
  };

  const getBook = (transaction) =>
    books.find(
      (book) => Number(book.id) === Number(transaction.bookId)
    );

  const processReturn = async (transaction, damaged) => {
    const person = getPerson(transaction);
    const book = getBook(transaction);

    const message = damaged
      ? `Mark "${book?.title || "this book"}" as DAMAGED for ${person?.name || "this user"}? A full-price payment request will be created.`
      : `Mark "${book?.title || "this book"}" as normally returned?`;

    if (!window.confirm(message)) {
      return;
    }

    setBusyId(transaction.id);

    try {
      await api(
        `/api/book-transactions/${transaction.id}/return?damaged=${damaged}`,
        { method: "POST" }
      );

      await reload();

      if (damaged) {
        alert("Damaged return recorded. A payment request has been created.");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="dashboard-panel">

      <div className="panel-heading">
        <div>
          <span className="section-label">LIBRARIAN DESK</span>
          <h2>Book returns</h2>
        </div>
      </div>

      {activeLoans.length === 0 ? (
        <Empty message="No active books are currently issued." />
      ) : (
        <div className="data-list">

          {activeLoans.map((transaction) => {
            const person = getPerson(transaction);
            const book = getBook(transaction);

            return (
              <div className="data-row" key={transaction.id}>

                <div>
                  <strong>
                    {book?.title || `Book #${transaction.bookId}`}
                  </strong>

                  <span>
                    {transaction.userType} ·{" "}
                    {person?.name || `User #${transaction.userId}`}
                    {" · ID "}
                    {transaction.userId}
                  </span>

                  <span>
                    Issued:{" "}
                    {transaction.issueDate
                      ? new Date(transaction.issueDate).toLocaleDateString()
                      : "—"}
                    {" · "}
                    Due:{" "}
                    {transaction.dueDate
                      ? new Date(transaction.dueDate).toLocaleDateString()
                      : "—"}
                  </span>
                </div>

                <div className="row-actions">

                  <button
                    className="small-action-button"
                    disabled={busyId === transaction.id}
                    onClick={() =>
                      processReturn(transaction, false)
                    }
                  >
                    <CheckCircle size={15} />
                    Normal Return
                  </button>

                  <button
                    className="small-action-button danger"
                    disabled={busyId === transaction.id}
                    onClick={() =>
                      processReturn(transaction, true)
                    }
                  >
                    <AlertCircle size={15} />
                    Damaged
                  </button>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}


/* ================= PEOPLE ================= */

function People({
  students,
  teachers
}) {
  const [search, setSearch] = useState("");

  const people = [
    ...students.map((person) => ({
      ...person,
      personType: "STUDENT"
    })),
    ...teachers.map((person) => ({
      ...person,
      personType: "TEACHER"
    }))
  ];

  const filtered = people.filter((person) =>
    `${person.name || ""} ${person.id || ""} ${person.department || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-panel">

      <div className="panel-heading">
        <div>
          <span className="section-label">PEOPLE</span>
          <h2>Find a student or teacher</h2>
        </div>
      </div>

      <div className="search-box">
        <Search size={18} />
        <input
          placeholder="Search by name, ID or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <Empty message="No matching person found." />
      ) : (
        <div className="people-grid">

          {filtered.map((person) => (
            <div className="person-card" key={`${person.personType}-${person.id}`}>

              <div className="role-icon">
                {person.personType === "STUDENT"
                  ? <GraduationCap />
                  : <Users />}
              </div>

              <div>
                <span className="section-label">
                  {person.personType}
                </span>

                <h3>{person.name}</h3>

                <p>ID: {person.id}</p>

                <p>
                  {person.department || "Department not provided"}
                </p>

                <p>
                  Current books: {person.currentBooks || 0}
                </p>

                {person.personType === "STUDENT" &&
                  person.banned && (
                    <span className="status-badge rejected">
                      Banned until{" "}
                      {person.banUntil
                        ? new Date(person.banUntil).toLocaleDateString()
                        : "further notice"}
                    </span>
                  )}
              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}


/* ================= LIBRARIAN PAYMENTS ================= */

function LibrarianPayments({
  transactions,
  students,
  teachers,
  reload
}) {
  const [busyId, setBusyId] = useState(null);

  const pending = transactions.filter(
    (transaction) => transaction.status === "PENDING"
  );

  const getPerson = (transaction) => {
    const source =
      transaction.personType?.toUpperCase() === "STUDENT"
        ? students
        : teachers;

    return source.find(
      (person) =>
        String(person.id) === String(transaction.personId)
    );
  };

  const markPaid = async (transaction) => {
    const receipt = window.prompt(
      "Enter receipt number:",
      `REC-${transaction.id}-${Date.now()}`
    );

    if (!receipt) {
      return;
    }

    setBusyId(transaction.id);

    try {
      await api(
        `/api/transactions/${transaction.id}/pay?receiptNumber=${encodeURIComponent(receipt)}`,
        { method: "PUT" }
      );

      await reload();
    } catch (error) {
      alert(error.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="dashboard-panel">

      <div className="panel-heading">
        <div>
          <span className="section-label">CASH OFFICE</span>
          <h2>Pending payments</h2>
        </div>
      </div>

      {pending.length === 0 ? (
        <Empty message="No pending payments." />
      ) : (
        <div className="data-list">

          {pending.map((transaction) => {
            const person = getPerson(transaction);

            return (
              <div className="data-row" key={transaction.id}>

                <div>
                  <strong>
                    ₹{Number(transaction.amount || 0).toFixed(2)}
                  </strong>

                  <span>
                    {transaction.personType} ·{" "}
                    {person?.name || `User #${transaction.personId}`}
                    {" · ID "}
                    {transaction.personId}
                  </span>

                  <span>
                    {transaction.description || "Payment requested"}
                  </span>
                </div>

                <button
                  className="small-action-button"
                  disabled={busyId === transaction.id}
                  onClick={() => markPaid(transaction)}
                >
                  <CheckCircle size={15} />
                  {busyId === transaction.id
                    ? "Saving..."
                    : "Mark Paid"}
                </button>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}


/* ================= PUBLIC REQUESTS ================= */

function PublicRequests({
  requests,
  reload
}) {
  const [busyId, setBusyId] = useState(null);

  const active = requests.filter(
    (request) => request.status === "OPEN"
  );

  const update = async (id, action) => {
    setBusyId(id);

    try {
      await api(
        `/api/public-requests/${id}/${action}`,
        { method: "PUT" }
      );

      await reload();
    } catch (error) {
      alert(error.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="dashboard-panel">

      <div className="panel-heading">
        <div>
          <span className="section-label">COMMUNITY</span>
          <h2>Public book requests</h2>
        </div>
      </div>

      {active.length === 0 ? (
        <Empty message="No open public requests." />
      ) : (
        <div className="data-list">

          {active.map((request) => (
            <div className="data-row" key={request.id}>

              <div>
                <strong>{request.bookTitle}</strong>

                <span>
                  {request.author
                    ? `by ${request.author}`
                    : "Author not provided"}
                </span>

                <span>
                  {request.likes || 0} likes ·{" "}
                  {request.name || "Anonymous"}
                </span>

                {request.description && (
                  <span>{request.description}</span>
                )}
              </div>

              <div className="row-actions">

                <button
                  className="small-action-button"
                  disabled={busyId === request.id}
                  onClick={() =>
                    update(request.id, "fulfill")
                  }
                >
                  <CheckCircle size={15} />
                  Fulfill
                </button>

                <button
                  className="small-action-button danger"
                  disabled={busyId === request.id}
                  onClick={() =>
                    update(request.id, "close")
                  }
                >
                  <X size={15} />
                  Close
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}


/* ================= TRANSACTION HISTORY ================= */

function TransactionHistory({
  transactions
}) {
  return (
    <div className="dashboard-panel">

      <div className="panel-heading">
        <div>
          <span className="section-label">HISTORY</span>
          <h2>Transactions</h2>
        </div>
      </div>

      {transactions.length === 0 ? (
        <Empty message="No transactions recorded." />
      ) : (
        <div className="data-list">

          {transactions.map((transaction) => (
            <div className="data-row" key={transaction.id}>

              <div>
                <strong>
                  {transaction.type?.replaceAll("_", " ")}
                </strong>

                <span>
                  {transaction.personType} · ID {transaction.personId}
                </span>

                <span>
                  ₹{Number(transaction.amount || 0).toFixed(2)}
                  {" · "}
                  {transaction.paymentMethod || "—"}
                </span>

                {transaction.description && (
                  <span>{transaction.description}</span>
                )}
              </div>

              <StatusBadge status={transaction.status} />

            </div>
          ))}

        </div>
      )}

    </div>
  );
}


/* ================= REQUEST MODAL ================= */

function RequestModal({
  onClose,
  onCreated
}) {
  const [form, setForm] = useState({
    name: "",
    contact: "",
    bookTitle: "",
    author: "",
    description: ""
  });

  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!form.bookTitle.trim()) {
      alert("Enter a book title.");
      return;
    }

    setSaving(true);

    try {
      await api("/api/public-requests", {
        method: "POST",
        body: JSON.stringify(form)
      });

      await onCreated();
      onClose();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>

      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >

        <button className="close-button" onClick={onClose}>
          <X size={19} />
        </button>

        <div className="modal-icon">
          <Plus size={24} />
        </div>

        <span className="section-label">
          COMMUNITY REQUEST
        </span>

        <h2>Suggest a book</h2>

        <p>
          Tell the library what you'd like to see on the shelves.
        </p>

        <form onSubmit={submit}>

          <label className="user-select-label">
            Your name
          </label>

          <input
            className="user-select"
            placeholder="Optional"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <label className="user-select-label">
            Contact
          </label>

          <input
            className="user-select"
            placeholder="Optional"
            value={form.contact}
            onChange={(e) =>
              setForm({ ...form, contact: e.target.value })
            }
          />

          <label className="user-select-label">
            Book title *
          </label>

          <input
            className="user-select"
            placeholder="e.g. Introduction to Algorithms"
            value={form.bookTitle}
            onChange={(e) =>
              setForm({ ...form, bookTitle: e.target.value })
            }
            required
          />

          <label className="user-select-label">
            Author
          </label>

          <input
            className="user-select"
            placeholder="Optional"
            value={form.author}
            onChange={(e) =>
              setForm({ ...form, author: e.target.value })
            }
          />

          <label className="user-select-label">
            Why should we add it?
          </label>

          <textarea
            className="user-select"
            placeholder="Optional"
            rows="3"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <button
            className="continue-button"
            type="submit"
            disabled={saving}
          >
            {saving ? "Submitting..." : "Submit Request"}
            <ArrowRight size={17} />
          </button>

        </form>

      </div>
    </div>
  );
}



/* ================= PROFILE ================= */

function ProfileView({ role, user, reload }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    department: user?.department || "",
    year: user?.year || "",
    password: ""
  });

  const [saving, setSaving] = useState(false);

  const endpoint =
    role === "student"
      ? "/api/students"
      : role === "teacher"
        ? "/api/teachers"
        : "/api/librarians";

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        department: form.department
      };

      if (role === "student") {
        payload.year = Number(form.year);
      }

      if (form.password.trim()) {
        payload.password = form.password;
      }

      await api(`${endpoint}/${user.id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      alert("Profile updated successfully.");
      await reload();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-panel">

      <div className="panel-heading">
        <div>
          <span className="section-label">MY ACCOUNT</span>
          <h2>{user?.profileCompleted ? "Update Profile" : "Complete Your Profile"}</h2>
        </div>
      </div>

      {!user?.profileCompleted && role !== "librarian" && (
        <div className="warning-panel">
          <AlertCircle size={18} />
          <span>
            Your profile is not complete yet. Fill in your details and save them.
          </span>
        </div>
      )}

      <form onSubmit={submit}>

        <div className="profile-grid">

          <div>
            <label className="user-select-label">ID</label>
            <input
              className="user-select"
              value={user?.id || ""}
              disabled
            />
          </div>

          <div>
            <label className="user-select-label">Name</label>
            <input
              className="user-select"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="user-select-label">Email</label>
            <input
              className="user-select"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="user-select-label">Phone</label>
            <input
              className="user-select"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="user-select-label">Department</label>
            <input
              className="user-select"
              value={form.department}
              onChange={(e) =>
                setForm({ ...form, department: e.target.value })
              }
              required
            />
          </div>

          {role === "student" && (
            <div>
              <label className="user-select-label">Year</label>
              <input
                className="user-select"
                type="number"
                min="1"
                max="6"
                value={form.year}
                onChange={(e) =>
                  setForm({ ...form, year: e.target.value })
                }
                required
              />
            </div>
          )}

          <div>
            <label className="user-select-label">
              New Password
            </label>
            <input
              className="user-select"
              type="password"
              placeholder="Leave blank to keep current password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

        </div>

        <button
          className="continue-button"
          type="submit"
          disabled={saving}
          style={{ marginTop: "20px" }}
        >
          {saving ? "Saving..." : "Save Profile"}
          <CheckCircle size={17} />
        </button>

      </form>
    </div>
  );
}


/* ================= MANAGE BOOKS ================= */

function ManageBooks({ books, reload }) {
  const empty = {
    title: "",
    author: "",
    isbn: "",
    category: "",
    price: "",
    totalCopies: 1
  };

  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = books.filter((book) =>
    `${book.title || ""} ${book.author || ""} ${book.isbn || ""} ${book.category || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const saveBook = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        title: form.title,
        author: form.author,
        isbn: form.isbn,
        category: form.category,
        price: Number(form.price),
        totalCopies: Number(form.totalCopies)
      };

      if (editingId) {
        await api(`/api/books/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
        alert("Book updated.");
      } else {
        await api("/api/books", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        alert("Book added successfully.");
      }

      setForm(empty);
      setEditingId(null);
      await reload();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const editBook = (book) => {
    setEditingId(book.id);
    setForm({
      title: book.title || "",
      author: book.author || "",
      isbn: book.isbn || "",
      category: book.category || "",
      price: book.price ?? "",
      totalCopies: book.totalCopies ?? 1
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addCopies = async (book) => {
    const value = prompt(`How many copies to add to "${book.title}"?`);
    const copies = Number(value);

    if (!copies || copies < 1) return;

    try {
      await api(`/api/books/${book.id}/add-copies?copies=${copies}`, {
        method: "PUT"
      });
      await reload();
    } catch (error) {
      alert(error.message);
    }
  };

  const removeCopies = async (book) => {
    const value = prompt(`How many copies to remove from "${book.title}"?`);
    const copies = Number(value);

    if (!copies || copies < 1) return;

    try {
      await api(`/api/books/${book.id}/remove-copies?copies=${copies}`, {
        method: "PUT"
      });
      await reload();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>

      <div className="dashboard-panel">

        <div className="panel-heading">
          <div>
            <span className="section-label">LIBRARY ADMINISTRATION</span>
            <h2>{editingId ? "Edit Book" : "Add New Book"}</h2>
          </div>
        </div>

        <form onSubmit={saveBook}>

          <div className="profile-grid">

            <div>
              <label className="user-select-label">Title</label>
              <input
                className="user-select"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="user-select-label">Author</label>
              <input
                className="user-select"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="user-select-label">ISBN</label>
              <input
                className="user-select"
                value={form.isbn}
                onChange={(e) => setForm({ ...form, isbn: e.target.value })}
              />
            </div>

            <div>
              <label className="user-select-label">Category</label>
              <input
                className="user-select"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>

            <div>
              <label className="user-select-label">Price</label>
              <input
                className="user-select"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="user-select-label">Total Copies</label>
              <input
                className="user-select"
                type="number"
                min="1"
                value={form.totalCopies}
                onChange={(e) => setForm({ ...form, totalCopies: e.target.value })}
                required
              />
            </div>

          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              className="continue-button"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving..." : editingId ? "Update Book" : "Add Book"}
              <Plus size={17} />
            </button>

            {editingId && (
              <button
                className="refresh-button"
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(empty);
                }}
              >
                Cancel
              </button>
            )}
          </div>

        </form>

      </div>


      <div className="dashboard-panel" style={{ marginTop: "20px" }}>

        <div className="panel-heading">
          <div>
            <span className="section-label">CATALOGUE</span>
            <h2>Manage Books</h2>
          </div>
        </div>

        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Search by title, author, ISBN or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="data-list">

          {filtered.map((book) => (
            <div className="data-row" key={book.id}>

              <div>
                <strong>{book.title}</strong>
                <span>
                  {book.author || "Unknown author"} · ID {book.id}
                </span>
              </div>

              <div>
                <strong>{book.availableCopies}/{book.totalCopies}</strong>
                <span>Available copies</span>
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button className="refresh-button" onClick={() => editBook(book)}>
                  Edit
                </button>

                <button className="refresh-button" onClick={() => addCopies(book)}>
                  + Copies
                </button>

                <button className="refresh-button" onClick={() => removeCopies(book)}>
                  - Copies
                </button>
              </div>

            </div>
          ))}

          {filtered.length === 0 && (
            <Empty message="No books found." />
          )}

        </div>

      </div>

    </div>
  );
}


/* ================= MANAGE STUDENTS ================= */

function ManageStudents({ students, reload }) {
  const empty = {
    id: "",
    name: "",
    email: "",
    phone: "",
    department: "",
    year: "",
    password: ""
  };

  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = students.filter((student) =>
    `${student.id} ${student.name || ""} ${student.email || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const save = async (e) => {
    e.preventDefault();

    if (!editingId) {
      if (!form.id.trim()) {
        alert("Student ID is required.");
        return;
      }

      if (!form.password.trim()) {
        alert("Password is required.");
        return;
      }
    }

    setSaving(true);

    try {
      if (editingId) {
        const payload = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          department: form.department,
          year: form.year ? Number(form.year) : 0
        };

        if (form.password.trim()) {
          payload.password = form.password;
        }

        await api(`/api/students/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });

        alert("Student updated.");
      } else {
        const payload = {
          id: form.id.trim(),
          password: form.password
        };

        await api("/api/students", {
          method: "POST",
          body: JSON.stringify(payload)
        });

        alert(
          `Student account created successfully.

Login ID: ${form.id}`
        );
      }

      setForm(empty);
      setEditingId(null);
      await reload();

    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (student) => {
    setEditingId(student.id);

    setForm({
      id: student.id,
      name: student.name || "",
      email: student.email || "",
      phone: student.phone || "",
      department: student.department || "",
      year: student.year || "",
      password: ""
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(empty);
  };

  return (
    <div>

      <div className="dashboard-panel">

        <div className="panel-heading">
          <div>
            <span className="section-label">STUDENT MANAGEMENT</span>
            <h2>{editingId ? "Edit Student" : "Create Student Account"}</h2>
          </div>
        </div>

        {!editingId && (
          <div className="warning-panel" style={{ marginBottom: "20px" }}>
            <strong>New student account</strong>
            <p>
              Enter only the student's login ID and password.
              The student will complete their profile after logging in.
            </p>
          </div>
        )}

        <form onSubmit={save}>

          {editingId ? (
            <div className="profile-grid">

              <div>
                <label className="user-select-label">Student ID</label>
                <input
                  className="user-select"
                  value={form.id}
                  disabled
                />
              </div>

              <div>
                <label className="user-select-label">Name</label>
                <input
                  className="user-select"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="user-select-label">Email</label>
                <input
                  className="user-select"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="user-select-label">Phone</label>
                <input
                  className="user-select"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="user-select-label">Department</label>
                <input
                  className="user-select"
                  value={form.department}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="user-select-label">Year</label>
                <input
                  className="user-select"
                  type="number"
                  min="1"
                  max="6"
                  value={form.year}
                  onChange={(e) =>
                    setForm({ ...form, year: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="user-select-label">
                  Password (optional)
                </label>
                <input
                  className="user-select"
                  type="password"
                  value={form.password}
                  placeholder="Leave blank to keep current"
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>

            </div>
          ) : (
            <div className="profile-grid">

              <div>
                <label className="user-select-label">
                  Student ID *
                </label>
                <input
                  className="user-select"
                  type="text"
                  value={form.id}
                  placeholder="Enter student ID (e.g. STU001)"
                  onChange={(e) =>
                    setForm({ ...form, id: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="user-select-label">
                  Password *
                </label>
                <input
                  className="user-select"
                  type="password"
                  value={form.password}
                  placeholder="Enter login password"
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
              </div>

            </div>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>

            <button
              className="continue-button"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Student"
                  : "Create Student"}

              <Plus size={17} />
            </button>

            {editingId && (
              <button
                type="button"
                className="continue-button"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}

          </div>

        </form>

      </div>

      <div className="dashboard-panel" style={{ marginTop: "20px" }}>

        <div className="panel-heading">
          <div>
            <span className="section-label">STUDENTS</span>
            <h2>Student Directory</h2>
          </div>
        </div>

        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Search by student name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="data-list">

          {filtered.map((student) => (
            <div className="data-row" key={student.id}>

              <div>
                <strong>
                  {student.name || "Profile incomplete"}
                </strong>

                <span>
                  ID {student.id} · {student.department || "No department"}
                </span>
              </div>

              <div>
                <StatusBadge
                  status={
                    student.banned
                      ? "BANNED"
                      : student.profileCompleted
                        ? "ACTIVE"
                        : "PROFILE INCOMPLETE"
                  }
                />
              </div>

              <div>
                <strong>{student.currentBooks || 0}</strong>
                <span>Borrowed</span>
              </div>

              <button
                className="refresh-button"
                onClick={() => startEdit(student)}
              >
                Edit
              </button>

            </div>
          ))}

          {filtered.length === 0 && (
            <Empty message="No students found." />
          )}

        </div>

      </div>

    </div>
  );
}


/* ================= MANAGE TEACHERS ================= */

function ManageTeachers({ teachers, reload }) {
  const empty = {
    id: "",
    name: "",
    email: "",
    phone: "",
    department: "",
    password: ""
  };

  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = teachers.filter((teacher) =>
    `${teacher.id} ${teacher.name || ""} ${teacher.email || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const save = async (e) => {
    e.preventDefault();

    if (!editingId) {
      if (!form.id.trim()) {
        alert("Teacher ID is required.");
        return;
      }

      if (!form.password.trim()) {
        alert("Password is required.");
        return;
      }
    }

    setSaving(true);

    try {
      if (editingId) {
        const payload = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          department: form.department
        };

        if (form.password.trim()) {
          payload.password = form.password;
        }

        await api(`/api/teachers/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });

        alert("Teacher updated.");
      } else {
        const payload = {
          id: form.id.trim(),
          password: form.password
        };

        await api("/api/teachers", {
          method: "POST",
          body: JSON.stringify(payload)
        });

        alert(
          `Teacher account created successfully.

Login ID: ${form.id}`
        );
      }

      setForm(empty);
      setEditingId(null);
      await reload();

    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (teacher) => {
    setEditingId(teacher.id);

    setForm({
      id: teacher.id,
      name: teacher.name || "",
      email: teacher.email || "",
      phone: teacher.phone || "",
      department: teacher.department || "",
      password: ""
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(empty);
  };

  return (
    <div>

      <div className="dashboard-panel">

        <div className="panel-heading">
          <div>
            <span className="section-label">TEACHER MANAGEMENT</span>
            <h2>{editingId ? "Edit Teacher" : "Create Teacher Account"}</h2>
          </div>
        </div>

        {!editingId && (
          <div className="warning-panel" style={{ marginBottom: "20px" }}>
            <strong>New teacher account</strong>
            <p>
              Enter only the teacher's login ID and password.
              The teacher will complete their profile after logging in.
            </p>
          </div>
        )}

        <form onSubmit={save}>

          {editingId ? (
            <div className="profile-grid">

              <div>
                <label className="user-select-label">Teacher ID</label>
                <input
                  className="user-select"
                  value={form.id}
                  disabled
                />
              </div>

              <div>
                <label className="user-select-label">Name</label>
                <input
                  className="user-select"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="user-select-label">Email</label>
                <input
                  className="user-select"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="user-select-label">Phone</label>
                <input
                  className="user-select"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="user-select-label">Department</label>
                <input
                  className="user-select"
                  value={form.department}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="user-select-label">
                  Password (optional)
                </label>
                <input
                  className="user-select"
                  type="password"
                  value={form.password}
                  placeholder="Leave blank to keep current"
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>

            </div>
          ) : (
            <div className="profile-grid">

              <div>
                <label className="user-select-label">
                  Teacher ID *
                </label>
                <input
                  className="user-select"
                  type="text"
                  value={form.id}
                  placeholder="Enter teacher ID (e.g. T-2026-01)"
                  onChange={(e) =>
                    setForm({ ...form, id: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="user-select-label">
                  Password *
                </label>
                <input
                  className="user-select"
                  type="password"
                  value={form.password}
                  placeholder="Enter login password"
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
              </div>

            </div>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>

            <button
              className="continue-button"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Teacher"
                  : "Create Teacher"}

              <Plus size={17} />
            </button>

            {editingId && (
              <button
                type="button"
                className="continue-button"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}

          </div>

        </form>

      </div>

      <div className="dashboard-panel" style={{ marginTop: "20px" }}>

        <div className="panel-heading">
          <div>
            <span className="section-label">TEACHERS</span>
            <h2>Teacher Directory</h2>
          </div>
        </div>

        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Search by teacher name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="data-list">

          {filtered.map((teacher) => (
            <div className="data-row" key={teacher.id}>

              <div>
                <strong>
                  {teacher.name || "Profile incomplete"}
                </strong>

                <span>
                  ID {teacher.id} · {teacher.department || "No department"}
                </span>
              </div>

              <div>
                <StatusBadge
                  status={
                    teacher.profileCompleted
                      ? "ACTIVE"
                      : "PROFILE INCOMPLETE"
                  }
                />
              </div>

              <div>
                <strong>{teacher.currentBooks || 0}</strong>
                <span>Borrowed</span>
              </div>

              <button
                className="refresh-button"
                onClick={() => startEdit(teacher)}
              >
                Edit
              </button>

            </div>
          ))}

          {filtered.length === 0 && (
            <Empty message="No teachers found." />
          )}

        </div>

      </div>

    </div>
  );
}


/* ================= UI HELPERS ================= */


function Stat({
  icon,
  title,
  value
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        {icon}
      </div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function QuickItem({
  icon,
  title,
  text
}) {
  return (
    <div className="quick-item">
      <div className="quick-icon">
        {icon}
      </div>

      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </div>
  );
}

function StatusBadge({
  status
}) {
  const normalized = status?.toUpperCase() || "UNKNOWN";

  const className =
    normalized === "APPROVED" ||
    normalized === "PAID" ||
    normalized === "COMPLETED" ||
    normalized === "FULFILLED"
      ? "approved"
      : normalized === "REJECTED" ||
          normalized === "CANCELLED" ||
          normalized === "CLOSED"
        ? "rejected"
        : "pending";

  return (
    <span className={`status-badge ${className}`}>
      {normalized.replaceAll("_", " ")}
    </span>
  );
}

function Empty({
  message
}) {
  return (
    <div className="empty-state">
      <BookOpen size={28} />
      <p>{message}</p>
    </div>
  );
}

function Transactions({
  transactions
}) {
  return (
    <TransactionHistory
      transactions={transactions}
    />
  );
}

export default App;

