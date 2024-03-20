package com.example.kmebackend.service

import com.example.kmebackend.model.*
import com.example.kmebackend.repository.ChordRepository
import com.example.kmebackend.repository.GroupingRepository
import org.springframework.stereotype.Service
import java.util.*
import kotlin.NoSuchElementException

@Service
data class ChordService(
    val noteService: NoteService,
    val chordRepository: ChordRepository,
    val groupingRepository: GroupingRepository,
) {
    /**
     * A wrapper around ChordRepository::save
     */
    fun save(chord: Chord): Chord {
        return chordRepository.save(chord)
    }

    /**
     * A wrapper around ChordRepository::findById
     */
    fun findById(chordId: ChordId): Optional<Chord> {
        return chordRepository.findById(chordId)
    }

    /**
     * A wrapper around ChordRepository::existsById
     */
    fun existsById(chordId: ChordId): Boolean {
        return chordRepository.existsById(chordId)
    }

    /**
     * Creates a new GroupingEntry for the new Chord and appends it to the list corresponding to groupingId.
     *
     * @param groupingId must correspond to a saved Grouping.
     * @param chord the instance from where data is copied to the new Chord. Its ID is ignored.
     * @return a new Chord inside a new GroupingEntry which is appended to the list corresponding to groupingId.
     */
    fun appendToGrouping(
        groupingId: GroupingId,
        chord: Chord,
    ): Chord {
        if (!groupingRepository.existsById(groupingId)) {
            throw NoSuchElementException("Grouping with ID $groupingId not found")
        }
        val groupingEntry =
            GroupingEntry(
                GroupingEntryId(
                    groupingId = groupingId,
                    groupingEntriesOrder = groupingRepository.countChildren(groupingId),
                ),
                grouping = groupingRepository.findById(groupingId).get(),
            )
        val newChord =
            chord.copy(
                chordId = ChordId(requireNotNull(groupingEntry.groupingEntryId)),
                groupingEntry = groupingEntry,
            )
        return newChord
    }

    /**
     * @param chordId the id of the Chord.
     * @return the number of children of the Chord corresponding to chordId.
     */
    fun countChildren(chordId: ChordId): Int {
        if (!existsById(chordId)) {
            throw NoSuchElementException("Chord with ID $chordId not found")
        }
        return chordRepository.countChildren(chordId)
    }

    /**
     * @param chordId the id of the Chord.
     * @return the number of children of the Chord corresponding to chordId.
     */
    fun getChildren(chordId: ChordId): List<Note> {
        if (!existsById(chordId)) {
            throw NoSuchElementException("Chord with ID $chordId not found")
        }
        return chordRepository.getChildren(chordId)
    }

    /**
     * Deletes all Chord entities and their children.
     */
    fun deleteAll() {
        noteService.deleteAll()
        chordRepository.deleteAll()
    }

    /**
     * Deletes the Chord corresponding to chordId and its children.
     * @param chordId the ID of the Chord to be deleted.
     * @throws NoSuchElementException if chordId doesn't correspond to a Chord.
     */
    fun deleteById(chordId: ChordId) {
        if (!existsById(chordId)) {
            throw NoSuchElementException("Chord with ID $chordId not found")
        }
        val children = getChildren(chordId)
        for (child in children) {
            noteService.deleteById(requireNotNull(child.noteId))
        }
        chordRepository.deleteById(chordId)
    }
}
