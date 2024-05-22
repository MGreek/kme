package com.example.kmebackend.repository

import com.example.kmebackend.model.Chord
import com.example.kmebackend.model.GroupingEntry
import com.example.kmebackend.model.GroupingEntryId
import com.example.kmebackend.model.Rest
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface GroupingEntryRepository : JpaRepository<GroupingEntry, GroupingEntryId> {
    @Query("SELECT r FROM Rest r WHERE r.restId.groupingEntryId = ?1")
    fun getRest(groupingEntryId: GroupingEntryId): Rest?

    @Query("SELECT c FROM Chord c WHERE c.chordId.groupingEntryId = ?1")
    fun getChord(groupingEntryId: GroupingEntryId): Chord?
}