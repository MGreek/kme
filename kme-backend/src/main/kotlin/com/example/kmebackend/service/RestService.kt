package com.example.kmebackend.service

import com.example.kmebackend.model.*
import com.example.kmebackend.repository.GroupingEntryRepository
import com.example.kmebackend.repository.GroupingRepository
import com.example.kmebackend.repository.RestRepository
import org.springframework.stereotype.Service

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
     * Creates a new GroupingEntry for the new Rest and appends it to the list corresponding to groupingId.
     *
     * @param groupingId must correspond to a saved Grouping.
     * @param rest the instance from where data is copied to the new Rest. Its ID is ignored.
     * @return a new Rest inside a new GroupingEntry which is appended to the list corresponding to groupingId.
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
}
