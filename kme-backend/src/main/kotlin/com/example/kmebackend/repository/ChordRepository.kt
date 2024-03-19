package com.example.kmebackend.repository

import com.example.kmebackend.model.*
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface ChordRepository : JpaRepository<Chord, ChordId> {
    /**
     * @return the number of notes which are children of the given Chord
     */
    @Query("SELECT COUNT(n) FROM Note n WHERE n.noteId.chordId = ?1")
    fun countChildren(chordId: ChordId): Int

    /**
     * @return the notes which are children of the given Chord
     */
    @Query("SELECT n FROM Note n WHERE n.noteId.chordId = ?1")
    fun getChildren(chordId: ChordId): List<Note>
}
