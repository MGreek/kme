package com.example.kmebackend.service

import com.example.kmebackend.model.*
import com.example.kmebackend.model.dto.RestDTO
import com.example.kmebackend.repository.GroupingEntryRepository
import com.example.kmebackend.repository.GroupingRepository
import com.example.kmebackend.repository.RestRepository
import org.springframework.stereotype.Service
import java.util.*
import kotlin.NoSuchElementException

@Service
data class RestService(
    val restRepository: RestRepository,
    val groupingRepository: GroupingRepository,
    val groupingEntryRepository: GroupingEntryRepository,
) {
    /**
     * A wrapper around RestRepository::save
     */
    fun save(rest: Rest): Rest {
        return restRepository.save(rest)
    }

    /**
     * A wrapper around RestRepository::findById
     */
    fun findById(restId: RestId): Optional<Rest> {
        return restRepository.findById(restId)
    }

    /**
     * A wrapper around RestRepository::existsById
     */
    fun existsById(restId: RestId): Boolean {
        return restRepository.existsById(restId)
    }

    /**
     * Creates a new GroupingEntry for the new Rest and appends it to the list corresponding to groupingId.
     *
     * @param groupingId must correspond to a saved Grouping.
     * @param rest the instance from where data is copied to the new Rest. Its ID is ignored.
     * @return a new Rest inside a new GroupingEntry which is appended to the list corresponding to groupingId.
     * @throws NoSuchElementException if groupingId doesn't correspond to a Grouping.
     */
    fun appendToGrouping(
        groupingId: GroupingId,
        rest: Rest,
    ): Rest {
        if (!groupingRepository.existsById(groupingId)) {
            throw NoSuchElementException("Grouping with ID $groupingId not found")
        }
        var groupingEntry =
            GroupingEntry(
                GroupingEntryId(
                    groupingId = groupingId,
                    groupingEntriesOrder = groupingRepository.countChildren(groupingId),
                ),
                grouping = groupingRepository.findById(groupingId).get(),
            )
        groupingEntry = groupingEntryRepository.save(groupingEntry)
        val newRest =
            rest.copy(
                restId = RestId(requireNotNull(groupingEntry.groupingEntryId)),
                groupingEntry = groupingEntry,
            )
        return newRest
    }

    /**
     * Deletes all Rest entities.
     */
    fun deleteAll() {
        restRepository.deleteAll()
    }

    /**
     * Deletes the Rest corresponding to restId
     * @param restId the ID of the Rest to be deleted.
     * @throws NoSuchElementException if restId doesn't correspond to a Rest.
     */
    fun deleteById(restId: RestId) {
        if (!existsById(restId)) {
            throw NoSuchElementException("Rest with ID $restId not found")
        }
        restRepository.deleteById(restId)
    }

    /**
     * Turns a [Rest] into a [RestDTO].
     * @param rest the instance that is used to create the [RestDTO].
     * @return a [RestDTO] that is derived from the given [Rest].
     * @throws UnsupportedOperationException if [rest's][rest] ID is null.
     * @throws NoSuchElementException if [rest] is not found.
     */
    fun restToDTO(rest: Rest): RestDTO {
        if (rest.restId == null) {
            throw UnsupportedOperationException("Rest's ID must not be null")
        }
        if (!existsById(requireNotNull(rest.restId))) {
            throw NoSuchElementException("Rest with ID ${requireNotNull(rest.restId)} not found")
        }
        return RestDTO(
            restType = rest.restType,
            metadata = rest.metadata,
        )
    }
}
