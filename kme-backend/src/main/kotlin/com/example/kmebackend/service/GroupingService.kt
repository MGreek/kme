package com.example.kmebackend.service

import com.example.kmebackend.model.*
import com.example.kmebackend.repository.GroupingRepository
import com.example.kmebackend.repository.VoiceRepository
import org.springframework.stereotype.Service
import java.util.*
import kotlin.NoSuchElementException

@Service
data class GroupingService(
    val groupingEntryService: GroupingEntryService,
    val groupingRepository: GroupingRepository,
    val voiceRepository: VoiceRepository,
) {
    /**
     * A wrapper around GroupingRepository::save
     */
    fun save(grouping: Grouping): Grouping {
        return groupingRepository.save(grouping)
    }

    /**
     * A wrapper around GroupingRepository::findById
     */
    fun findById(groupingId: GroupingId): Optional<Grouping> {
        return groupingRepository.findById(groupingId)
    }

    /**
     * A wrapper around GroupingRepository::existsById
     */
    fun existsById(groupingId: GroupingId): Boolean {
        return groupingRepository.existsById(groupingId)
    }

    /**
     * Creates a new Grouping and appends it to the list corresponding to voiceId.
     * @param voiceId must correspond to a saved Voice.
     * @param grouping the instance from where data is copied to the new Grouping. Its ID is ignored.
     * @return a new Grouping that is appended to the list corresponding to voiceId.
     * @throws NoSuchElementException if voiceId doesn't correspond to a Voice.
     */
    fun appendToVoice(
        voiceId: VoiceId,
        grouping: Grouping,
    ): Grouping {
        if (!voiceRepository.existsById(voiceId)) {
            throw NoSuchElementException("Voice with ID $voiceId not found")
        }
        val newGrouping =
            grouping.copy(
                groupingId =
                    GroupingId(
                        voiceId,
                        voiceRepository.countChildren(voiceId),
                    ),
                voice = voiceRepository.findById(voiceId).get(),
            )
        return newGrouping
    }

    /**
     * @param groupingId the id of the Grouping.
     * @return the number of children of the Grouping corresponding to groupingId.
     * @throws NoSuchElementException if groupingId doesn't correspond to a Grouping.
     */
    fun countChildren(groupingId: GroupingId): Int {
        if (!existsById(groupingId)) {
            throw NoSuchElementException("Grouping with ID $groupingId not found")
        }
        return groupingRepository.countChildren(groupingId)
    }

    /**
     * @param groupingId the id of the Grouping.
     * @return the number of rests belonging to the Grouping corresponding to groupingId.
     * @throws NoSuchElementException if groupingId doesn't correspond to a Grouping.
     */
    fun countRests(groupingId: GroupingId): Int {
        if (!existsById(groupingId)) {
            throw NoSuchElementException("Grouping with ID $groupingId not found")
        }
        return groupingRepository.countRests(groupingId)
    }

    /**
     * @param groupingId the id of the Grouping.
     * @return the number of chords belonging to the Grouping corresponding to groupingId.
     * @throws NoSuchElementException if groupingId doesn't correspond to a Grouping.
     */
    fun countChords(groupingId: GroupingId): Int {
        if (!existsById(groupingId)) {
            throw NoSuchElementException("Grouping with ID $groupingId not found")
        }
        return groupingRepository.countChords(groupingId)
    }

    /**
     * @param groupingId the id of the Grouping.
     * @return the rests belonging to the Grouping corresponding to groupingId.
     * @throws NoSuchElementException if groupingId doesn't correspond to a Grouping.
     */
    fun getRests(groupingId: GroupingId): List<Rest> {
        if (!existsById(groupingId)) {
            throw NoSuchElementException("Grouping with ID $groupingId not found")
        }
        return groupingRepository.getRests(groupingId)
    }

    /**
     * @param groupingId the id of the Grouping.
     * @return the chords belonging to the Grouping corresponding to groupingId.
     * @throws NoSuchElementException if groupingId doesn't correspond to a Grouping.
     */
    fun getChords(groupingId: GroupingId): List<Chord> {
        if (!existsById(groupingId)) {
            throw NoSuchElementException("Grouping with ID $groupingId not found")
        }
        return groupingRepository.getChords(groupingId)
    }

    /**
     * @param groupingId the id of the Grouping.
     * @return the groupingEntries belonging to the Grouping corresponding to groupingId.
     * @throws NoSuchElementException if groupingId doesn't correspond to a Grouping.
     */
    fun getChildren(groupingId: GroupingId): List<GroupingEntry> {
        if (!existsById(groupingId)) {
            throw NoSuchElementException("Grouping with ID $groupingId not found")
        }
        return groupingRepository.getGroupingEntries(groupingId)
    }

    /**
     * Deletes all Grouping entities and their children.
     */
    fun deleteAll() {
        groupingEntryService.deleteAll()
        groupingRepository.deleteAll()
    }

    /**
     * Deletes the Grouping corresponding to groupingId and its children.
     * @param groupingId the ID of the Grouping to be deleted.
     * @throws NoSuchElementException if groupingId doesn't correspond to a Grouping.
     */
    fun deleteById(groupingId: GroupingId) {
        if (!existsById(groupingId)) {
            throw NoSuchElementException("Grouping with ID $groupingId not found")
        }
        val children = getChildren(groupingId)
        for (child in children) {
            groupingEntryService.deleteById(requireNotNull(child.groupingEntryId))
        }
        groupingRepository.deleteById(groupingId)
    }
}