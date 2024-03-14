package com.example.kmebackend.repository

import com.example.kmebackend.model.StaffSystem
import com.example.kmebackend.model.StaffSystemId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface StaffSystemRepository : JpaRepository<StaffSystem, StaffSystemId> {
    /**
     * @return the number of staves which are children of the given StaffSystem
     */
    @Query("SELECT COUNT(s) FROM Staff s WHERE s.staffId.staffSystemId = ?1")
    fun countChildren(staffSystemId: StaffSystemId): Int
}
