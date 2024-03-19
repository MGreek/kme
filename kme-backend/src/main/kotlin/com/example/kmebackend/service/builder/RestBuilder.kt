package com.example.kmebackend.service.builder

import com.example.kmebackend.model.GroupingEntryId
import com.example.kmebackend.model.Rest
import com.example.kmebackend.model.RestId
import com.example.kmebackend.model.RestType
import com.example.kmebackend.service.RestService

class RestBuilder internal constructor(
    private val groupingBuilder: GroupingBuilder,
    private val restService: RestService,
) {
    private var selectedRestId: RestId? = null

    private var restType: RestType? = null
    private var metadata: String? = null
    private var overrideMetadata: Boolean = false

    fun setRestType(newRestType: RestType): RestBuilder {
        restType = newRestType
        return this
    }

    fun setMetadata(newMetadata: String?): RestBuilder {
        metadata = newMetadata
        overrideMetadata = true
        return this
    }

    fun save(): RestBuilder {
        if (selectedRestId == null) {
            throw UnsupportedOperationException("A Rest must be selected")
        }
        var rest = restService.findById(requireNotNull(selectedRestId)).orElseThrow()
        if (restType != null) {
            rest = rest.copy(restType = requireNotNull(restType))
        }
        restType = null
        if (overrideMetadata) {
            rest = rest.copy(metadata = metadata)
        }
        overrideMetadata = false

        restService.save(rest)
        return this
    }

    fun selectRest(index: Int): RestBuilder {
        val restId =
            RestId(
                groupingEntryId = GroupingEntryId(requireNotNull(groupingBuilder.selectedGroupingId), index),
            )
        if (!restService.existsById(restId)) {
            throw NoSuchElementException("Staff with ID $restId not found")
        }
        selectedRestId = restId
        return this
    }

    fun appendAndSelectRest(newRest: Rest): RestBuilder {
        var rest = restService.appendToGrouping(requireNotNull(groupingBuilder.selectedGroupingId), newRest)
        rest = restService.save(rest)
        selectedRestId = rest.restId
        return this
    }

    fun back(): GroupingBuilder {
        return groupingBuilder
    }
}
