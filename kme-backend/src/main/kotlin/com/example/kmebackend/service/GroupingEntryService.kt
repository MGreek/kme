package com.example.kmebackend.service

import com.example.kmebackend.model.*
import com.example.kmebackend.repository.GroupingEntryRepository
import com.example.kmebackend.repository.GroupingRepository
import org.springframework.stereotype.Service
import java.util.Optional

@Service
data class GroupingEntryService(
    val restService: RestService,
    val chordService: ChordService,
    val groupingEntryRepository: GroupingEntryRepository,
    val groupingRepository: GroupingRepository,
) {
    /**
     * A wrapper around GroupingEntryRepository::existsById
     */
    fun existsById(groupingEntryId: GroupingEntryId): Boolean {
        return groupingEntryRepository.existsById(groupingEntryId)
    }

    /**
     * Deletes all GroupingEntry entities and their children.
     */
    fun deleteAll() {
        restService.deleteAll()
        chordService.deleteAll()
        groupingEntryRepository.deleteAll()
    }

    /**
     * Retrieves a [Rest] by its parent's ID.
     * @param groupingEntryId the ID of the parent.
     * @return the entity with the given parent or Optional#empty() if none found.
     */
    fun getRest(groupingEntryId: GroupingEntryId): Optional<Rest> {
        if (!existsById(groupingEntryId)) {
            throw NoSuchElementException("Grouping with ID $groupingEntryId not found")
        }
        return restService.findById(RestId(groupingEntryId))
    }

    /**
     * Retrieves a [Chord] by its parent's ID.
     * @param groupingEntryId the ID of the parent.
     * @return the entity with the given parent or Optional#empty() if none found.
     */
    fun getChord(groupingEntryId: GroupingEntryId): Optional<Chord> {
        if (!existsById(groupingEntryId)) {
            throw NoSuchElementException("Grouping with ID $groupingEntryId not found")
        }
        return chordService.findById(ChordId(groupingEntryId))
    }

    /**
     * Deletes the GroupingEntry corresponding to groupingEntryId and its children.
     * @param groupingEntryId the ID of the GroupingEntry to be deleted.
     * @throws NoSuchElementException if groupingEntryId doesn't correspond to a GroupingEntry.
     */
    fun deleteById(groupingEntryId: GroupingEntryId) {
        if (!existsById(groupingEntryId)) {
            throw NoSuchElementException("Grouping with ID $groupingEntryId not found")
        }
        val rest = getRest(groupingEntryId)
        val chord = getChord(groupingEntryId)
        if (rest.isPresent) {
            restService.deleteById(requireNotNull(rest.orElseThrow().restId))
        } else {
            chordService.deleteById(requireNotNull(chord.orElseThrow().chordId))
        }
        groupingEntryRepository.deleteById(groupingEntryId)
    }
}