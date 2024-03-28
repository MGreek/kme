package com.example.kmebackend.service

import com.example.kmebackend.model.*
import com.example.kmebackend.model.dto.ChordDTO
import com.example.kmebackend.model.dto.NoteDTO
import com.example.kmebackend.model.dto.StemDTO
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
     * @throws NoSuchElementException if groupingId doesn't correspond to a Grouping.
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
     * @throws NoSuchElementException if chordId doesn't correspond to a Chord.
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
     * @throws NoSuchElementException if chordId doesn't correspond to a Chord.
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

    /**
     * Turns a [Chord] into a [ChordDTO].
     * @param chord the instance that is used to create the [ChordDTO].
     * @return a [ChordDTO] that is derived from the given [Chord].
     * @throws UnsupportedOperationException if [chord's][chord] ID is null.
     * @throws NoSuchElementException if [chord] is not found.
     */
    fun chordToDTO(chord: Chord): ChordDTO {
        if (chord.chordId == null) {
            throw UnsupportedOperationException("Chord's ID must not be null")
        }
        if (!existsById(requireNotNull(chord.chordId))) {
            throw NoSuchElementException("Chord with ID ${requireNotNull(chord.chordId)} not found")
        }
        val noteDTOs = mutableListOf<NoteDTO>()
        for (child in getChildren(requireNotNull(chord.chordId))) {
            noteDTOs.add(noteService.noteToDTO(child))
        }
        return ChordDTO(
            stemDTO = stemToDTO(chord.stem),
            dotCount = chord.dotCount,
            metadata = chord.metadata,
            noteDTOs = noteDTOs,
        )
    }

    /**
     * Turns a [Stem] into a [StemDTO].
     * @param stem the instance that is used to create the [StemDTO].
     * @return a [StemDTO] that is derived from the given [Stem].
     */
    private fun stemToDTO(stem: Stem): StemDTO {
        return StemDTO(
            stemType = stem.stemType,
            metadata = stem.metadata,
        )
    }
}
