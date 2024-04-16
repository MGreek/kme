package com.example.kmebackend.repository

import com.example.kmebackend.model.Measure
import com.example.kmebackend.model.Staff
import com.example.kmebackend.model.StaffId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface StaffRepository : JpaRepository<Staff, StaffId> {
    /**
     * @return the number of measures which are children of the given Staff
     */
    @Query("SELECT COUNT(m) FROM Measure m WHERE m.measureId.staffId = ?1")
    fun countChildren(staffId: StaffId): Int

    /**
     * @return the measures which are children of the given Staff
     */
    @Query("SELECT m FROM Measure m WHERE m.measureId.staffId = ?1 ORDER BY m.measureId.measuresOrder")
    fun getChildren(staffId: StaffId): List<Measure>
}