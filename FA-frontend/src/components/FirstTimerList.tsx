import React, { useState, useEffect } from "react"
import axios from "axios"

interface FirstTimer {
  id: number
  serviceDate: string
  firstName: string
  lastName: string
  email: string
}

const FirstTimerList = () => {
  const [firstTimers, setFirstTimers] = useState<FirstTimer[]>([])

  useEffect(() => {
    const fetchFirstTimers = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/first-timers`)
        setFirstTimers(response.data)
      } catch (error) {
        console.error("Error fetching first timers:", error)
      }
    }

    fetchFirstTimers()
  }, [])

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4">Recent First Timers</h2>
      <ul>
        {firstTimers.map((firstTimer) => (
          <li key={firstTimer.id} className="mb-2">
            <span className="font-semibold">
              {firstTimer.firstName} {firstTimer.lastName}
            </span>{" "}
            - {new Date(firstTimer.serviceDate).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default FirstTimerList

