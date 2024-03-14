package com.example.kmebackend.repository

import com.example.kmebackend.model.Grouping
import com.example.kmebackend.model.GroupingId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface GroupingRepository : JpaRepository<Grouping, GroupingId> {
    /**
     * @return the number of grouping-entries which are children of the given Grouping
     */
    @Query("SELECT COUNT(ge) FROM GroupingEntry ge WHERE ge.groupingEntryId.groupingId = ?1")
    fun countChildren(groupingId: GroupingId): Int
}
