import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { getCases, deleteCase } from "../lib/api";
import { STAGES } from "../lib/stages";
import { relativeTime, isStale } from "../lib/time";
import DashboardLayout from "../components/DashboardLayout";
import Toast from "../components/Toast";
import { useAuth } from "../AuthContext";
import styles from "../styles/Dashboard.module.css";

const RESOLVED_STAGE = "Resolved / Closed";

function filterFromPath(pathname) {
  if (pathname.endsWith("/active")) return "active";
  if (pathname.endsWith("/resolved")) return "resolved";
  return "all";
}

export default function Dashboard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState("");
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth();

  useEffect(() => {
    getCases()
      .then(setCases)
      .catch((err) => {
        if (err.status === 401) logout();
      })
      .finally(() => setLoading(false));
  }, [logout]);

  const filter = filterFromPath(pathname);
  const visibleCases = cases.filter((c) => {
    if (filter === "active") return c.stage !== RESOLVED_STAGE;
    if (filter === "resolved") return c.stage === RESOLVED_STAGE;
    return true;
  });

  function handleConfirmDelete() {
    setDeleting(true);
    deleteCase(pendingDelete.id)
      .then(() => {
        setCases((prev) => prev.filter((c) => c.id !== pendingDelete.id));
        setPendingDelete(null);
      })
      .catch(() => setToast("Failed to delete client."))
      .finally(() => setDeleting(false));
  }

  return (
    <DashboardLayout>
      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : visibleCases.length === 0 ? (
        <EmptyState filter={filter} hasAnyCases={cases.length > 0} />
      ) : (
        <table className={styles.table}>
          {/* Table heading */}
          <thead>
            <tr>
              <th>Client</th>
              <th>Case Type</th>
              <th>Stage</th>
              <th>Last Updated</th>
              <th></th>
            </tr>
          </thead>

          {/* Client card */}
          <tbody>
            {visibleCases.map((c) => (
              <tr
                key={c.id}
                className={isStale(c.updatedAt) ? styles.stale : undefined}
                onClick={() => navigate(`/cases/${c.id}`)}
              >
                <td className={styles.clientName}>{c.clientName}</td>
                <td>{c.caseType}</td>
                <td>
                  <StagePill stage={c.stage} />
                </td>
                <td className={styles.timestamp}>
                  {relativeTime(c.updatedAt)}
                </td>
                <td className={styles.actions}>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingDelete(c);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pendingDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <p className={styles.modalText}>
              Are you sure you want to delete client {pendingDelete.clientName}?
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalDeleteBtn}
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast} onDismiss={() => setToast("")} />
    </DashboardLayout>
  );
}

function StagePill({ stage }) {
  const stageInfo = STAGES.find((s) => s.label === stage);
  const color = stageInfo?.color ?? "blue";
  return <span className={`${styles.pill} ${styles[color]}`}>{stage}</span>;
}

function EmptyState({ filter, hasAnyCases }) {
  if (filter !== "all" && hasAnyCases) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>
          {filter === "active" ? "No active cases." : "No resolved cases yet."}
        </p>
        <Link to="/dashboard" className={styles.addBtn}>
          View all cases
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.empty}>
      <p className={styles.emptyText}>No cases yet.</p>
      <p className={styles.emptyHint}>
        Add your first case to start keeping clients informed.
      </p>
      <Link to="/add-case" className={styles.addBtn}>
        Add your first case
      </Link>
    </div>
  );
}
