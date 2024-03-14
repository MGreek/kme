package com.example.kmebackend.repository

import com.example.kmebackend.model.Measure
import com.example.kmebackend.model.MeasureId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface MeasureRepository : JpaRepository<Measure, MeasureId> {
    /**
     * @return the number of voices which are children of the given Measure
     */
    @Query("SELECT COUNT(v) FROM Voice v WHERE v.voiceId.measureId = ?1")
    fun countChildren(measureId: MeasureId): Int
}
