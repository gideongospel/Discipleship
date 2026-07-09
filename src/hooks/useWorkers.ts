import { useEffect, useState } from 'react'
import { getAllUsers } from '../services/userService'
import type { AppUser } from '../types'

export function useWorkers() {
  const [workers, setWorkers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllUsers().then((users) => {
      setWorkers(users.filter((u) => u.status === 'active'))
      setLoading(false)
    })
  }, [])

  return { workers, loading }
}
