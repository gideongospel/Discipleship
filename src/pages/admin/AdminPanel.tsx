import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ShieldCheck, ShieldOff, KeyRound, UserPlus, X } from 'lucide-react'
import { collection, doc, getDocs, query, where, writeBatch } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../context/AuthContext'
import { getAllUsers, setUserRole, setUserStatus, createUserProfile, deleteUserProfileDoc } from '../../services/userService'
import {
  generatePin,
  generateUniqueLoginId,
  provisionAccount,
  createLoginMapping,
  repointLoginId,
} from '../../services/loginService'
import { logAudit } from '../../services/auditService'
import { listDisciples, updateDisciple } from '../../services/discipleService'
import type { AppUser, Disciple } from '../../types'
import { FullScreenLoader } from '../../components/layout/ProtectedRoute'

export default function AdminPanel() {
  const { profile } = useAuth()
  const [users, setUsers] = useState<AppUser[]>([])
  const [disciples, setDisciples] = useState<Disciple[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddWorker, setShowAddWorker] = useState(false)
  const [credentialModal, setCredentialModal] = useState<{ name: string; loginId: string; pin: string } | null>(null)

  const load = async () => {
    if (!profile) return
    const [u, d] = await Promise.all([getAllUsers(), listDisciples(profile)])
    setUsers(u)
    setDisciples(d)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  if (loading) return <FullScreenLoader />

  const toggleRole = async (u: AppUser) => {
    if (!profile) return
    const newRole = u.role === 'administrator' ? 'worker' : 'administrator'
    if (!confirm(`${newRole === 'administrator' ? 'Promote' : 'Demote'} ${u.name} to ${newRole}?`)) return
    await setUserRole(u.uid, newRole)
    await logAudit({
      actorId: profile.uid,
      actorName: profile.name,
      action: newRole === 'administrator' ? 'promote_user' : 'demote_user',
      targetType: 'user',
      targetId: u.uid,
    })
    load()
  }

  const toggleSuspend = async (u: AppUser) => {
    if (!profile) return
    const newStatus = u.status === 'suspended' ? 'active' : 'suspended'
    await setUserStatus(u.uid, newStatus)
    await logAudit({
      actorId: profile.uid,
      actorName: profile.name,
      action: newStatus === 'suspended' ? 'suspend_user' : 'reactivate_user',
      targetType: 'user',
      targetId: u.uid,
    })
    load()
  }

  const resetPin = async (u: AppUser) => {
    if (!profile) return
    if (
      !confirm(
        `Reset ${u.name}'s PIN? Their old PIN will stop working immediately. Their Worker ID (${u.loginId}) stays the same.`,
      )
    )
      return

    const newPin = generatePin()
    // Client-side Firebase Auth cannot change another user's password
    // without a paid backend function, so a reset means provisioning a
    // fresh account under the same Worker ID and re-pointing every record
    // that referenced the old uid. See README for the full explanation.
    const { uid: newUid, email: newEmail } = await provisionAccount(u.loginId, newPin)
    await createUserProfile(newUid, u.name, u.loginId, u.role, profile.uid)
    await repointLoginId(u.loginId, newUid, newEmail)

    // Re-point references. Batches are capped at 500 writes by Firestore —
    // fine at church scale, but if a single worker is ever assigned to
    // more than ~500 records this needs chunking.
    const batch = writeBatch(db)

    const discipleSnap = await getDocs(query(collection(db, 'disciples'), where('assignedWorkerIds', 'array-contains', u.uid)))
    discipleSnap.forEach((d) => {
      const data = d.data() as Disciple
      const ids = data.assignedWorkerIds.map((id) => (id === u.uid ? newUid : id))
      batch.update(doc(db, 'disciples', d.id), { assignedWorkerIds: ids })
    })

    const followUpSnap = await getDocs(query(collection(db, 'followUps'), where('workerId', '==', u.uid)))
    followUpSnap.forEach((f) => batch.update(doc(db, 'followUps', f.id), { workerId: newUid }))

    await batch.commit()
    await deleteUserProfileDoc(u.uid)

    await logAudit({
      actorId: profile.uid,
      actorName: profile.name,
      action: 'reset_pin',
      targetType: 'user',
      targetId: newUid,
      details: `Worker ID ${u.loginId}, old uid ${u.uid}`,
    })

    setCredentialModal({ name: u.name, loginId: u.loginId, pin: newPin })
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin Panel</h1>
        <button className="btn-primary" onClick={() => setShowAddWorker(true)}>
          <UserPlus size={16} /> Add Worker
        </button>
      </div>

      {showAddWorker && (
        <AddWorkerForm
          onClose={() => setShowAddWorker(false)}
          onCreated={(cred) => {
            setShowAddWorker(false)
            setCredentialModal(cred)
            load()
          }}
        />
      )}

      {credentialModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-sm p-6 text-center">
            <h2 className="mb-2 font-semibold">{credentialModal.name}'s login details</h2>
            <p className="mb-4 text-sm text-slate-500">Write these down now — the PIN won't be shown again.</p>
            <div className="mb-4 space-y-2 rounded-lg bg-slate-50 p-4 text-left dark:bg-slate-800">
              <p className="text-sm">
                <span className="text-slate-500">Worker ID:</span>{' '}
                <span className="font-mono text-lg font-semibold">{credentialModal.loginId}</span>
              </p>
              <p className="text-sm">
                <span className="text-slate-500">PIN:</span>{' '}
                <span className="font-mono text-lg font-semibold">{credentialModal.pin}</span>
              </p>
            </div>
            <button onClick={() => setCredentialModal(null)} className="btn-primary w-full">
              Done
            </button>
          </div>
        </div>
      )}

      <div className="card p-5">
        <h2 className="mb-3 font-semibold">All Users ({users.length})</h2>
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 text-left text-xs uppercase text-slate-500 dark:border-slate-800">
            <tr>
              <th className="py-2">Name</th>
              <th className="py-2">Worker ID</th>
              <th className="py-2">Role</th>
              <th className="py-2">Status</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((u) => (
              <tr key={u.uid}>
                <td className="py-2 font-medium">{u.name}</td>
                <td className="py-2 font-mono text-xs">{u.loginId}</td>
                <td className="py-2 capitalize">{u.role}</td>
                <td className="py-2 capitalize">{u.status}</td>
                <td className="py-2 text-right">
                  <div className="inline-flex gap-2">
                    <button onClick={() => resetPin(u)} className="btn-secondary !px-2 !py-1" title="Reset PIN">
                      <KeyRound size={14} />
                    </button>
                    <button
                      onClick={() => toggleRole(u)}
                      disabled={u.uid === profile?.uid}
                      className="btn-secondary !px-2 !py-1"
                      title={u.role === 'administrator' ? 'Demote to worker' : 'Promote to administrator'}
                    >
                      {u.role === 'administrator' ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                    </button>
                    <button
                      onClick={() => toggleSuspend(u)}
                      disabled={u.uid === profile?.uid}
                      className="btn-secondary !px-2 !py-1"
                    >
                      {u.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AssignmentsPanel disciples={disciples} users={users} onChanged={load} />
    </div>
  )
}

function AddWorkerForm({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (cred: { name: string; loginId: string; pin: string }) => void
}) {
  const { profile } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ name: string }>()

  const onSubmit = async (values: { name: string }) => {
    if (!profile) return
    const loginId = await generateUniqueLoginId()
    const pin = generatePin()
    const { uid, email } = await provisionAccount(loginId, pin)
    await createLoginMapping(loginId, uid, email)
    await createUserProfile(uid, values.name, loginId, 'worker', profile.uid)
    await logAudit({
      actorId: profile.uid,
      actorName: profile.name,
      action: 'create_worker',
      targetType: 'user',
      targetId: uid,
      details: values.name,
    })
    onCreated({ name: values.name, loginId, pin })
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="card w-full max-w-sm p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Add Worker</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="label">Full name *</label>
            <input className="input" {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <p className="text-xs text-slate-500">
            A Worker ID and PIN will be generated automatically — you'll see them once, right after creating this account.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Creating...' : 'Create worker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AssignmentsPanel({
  disciples,
  users,
  onChanged,
}: {
  disciples: Disciple[]
  users: AppUser[]
  onChanged: () => void
}) {
  const { profile } = useAuth()
  const workers = users.filter((u) => u.status === 'active')

  const toggle = async (disciple: Disciple, workerUid: string) => {
    if (!profile) return
    const has = disciple.assignedWorkerIds.includes(workerUid)
    const ids = has
      ? disciple.assignedWorkerIds.filter((id) => id !== workerUid)
      : [...disciple.assignedWorkerIds, workerUid]
    if (ids.length === 0) {
      alert('A disciple must have at least one assigned worker.')
      return
    }
    const names = ids.map((id) => workers.find((w) => w.uid === id)?.name ?? id)
    await updateDisciple(disciple.id, { assignedWorkerIds: ids, assignedWorkerNames: names }, profile)
    onChanged()
  }

  return (
    <div className="card p-5">
      <h2 className="mb-1 font-semibold">Disciple Assignments</h2>
      <p className="mb-3 text-xs text-slate-500">
        Check or uncheck workers to share or reassign a disciple. Changes take effect immediately.
      </p>
      <div className="max-h-96 space-y-3 overflow-y-auto">
        {disciples.length === 0 && <p className="text-sm text-slate-500">No disciples registered yet.</p>}
        {disciples.map((d) => (
          <div key={d.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <p className="mb-2 text-sm font-medium">{d.name}</p>
            <div className="flex flex-wrap gap-3">
              {workers.map((w) => (
                <label key={w.uid} className="flex items-center gap-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={d.assignedWorkerIds.includes(w.uid)}
                    onChange={() => toggle(d, w.uid)}
                  />
                  {w.name}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
