package com.example.kmebackend.repository

import com.example.kmebackend.model.Chord
import com.example.kmebackend.model.Grouping
import com.example.kmebackend.model.GroupingId
import com.example.kmebackend.model.Rest
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

    /**
     * @return the number of rests which are children of the given Grouping
     */
    @Query("SELECT COUNT(r) FROM Rest r WHERE r.restId.groupingEntryId.groupingId = ?1")
    fun countRests(groupingId: GroupingId): Int

    /**
     * @return the number of chords which are children of the given Grouping
     */
    @Query("SELECT COUNT(c) FROM Chord c WHERE c.chordId.groupingEntryId.groupingId = ?1")
    fun countChords(groupingId: GroupingId): Int

    /**
     * @return the rests which are children of the given Grouping
     */
    @Query("SELECT r FROM Rest r WHERE r.restId.groupingEntryId.groupingId = ?1")
    fun getRests(groupingId: GroupingId): List<Rest>

    /**
     * @return the chords which are children of the given Grouping
     */
    @Query("SELECT c FROM Chord c WHERE c.chordId.groupingEntryId.groupingId = ?1")
    fun getChords(groupingId: GroupingId): List<Chord>
}
