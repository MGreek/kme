package com.example.kmebackend.service.builder

import com.example.kmebackend.model.*
import com.example.kmebackend.service.RestService

/**
 * A class that makes building [Rests][Rest] easier and faster.
 */
class RestBuilder internal constructor(
    private val groupingBuilder: GroupingBuilder,
    private val restService: RestService,
) {
    private var selectedRestId: RestId? = null

    private var restType: RestType? = null
    private var metadata: RestMetadata? = null

    /**
     * Stores [newRestType] that will be used to override the selected [Rest's][Rest] [Rest.restType].
     * @param newRestType the data that will be used to override the selected [Rest's][Rest] [Rest.restType].
     * @return the same [RestBuilder] instance that called this function.
     * @see save
     */
    fun setRestType(newRestType: RestType): RestBuilder {
        restType = newRestType
        return this
    }

    /**
     * Stores [newMetadata] that will be used to override the selected [Rest's][Rest] [Rest.metadata].
     * @param newMetadata the data that will be used to override the selected [Rest's][Rest] [Rest.metadata].
     * @return the same [RestBuilder] instance that called this function.
     * @see save
     */
    fun setMetadata(newMetadata: RestMetadata?): RestBuilder {
        metadata = newMetadata
        return this
    }

    /**
     * @return the selected [Rest's][Rest] ID.
     * @throws UnsupportedOperationException if no [Rest] was selected.
     */
    fun getSelectedRestId(): RestId {
        if (selectedRestId == null) {
            throw UnsupportedOperationException("A Rest must be selected")
        }
        return requireNotNull(selectedRestId)
    }

    /**
     * Overrides the data that has been set for the selected [Rest] and then saves it.
     * The data that has been set is then discarded.
     * @return the same [RestBuilder] instance that called this function.
     * @throws UnsupportedOperationException if no [Rest] was selected.
     */
    fun save(): RestBuilder {
        if (selectedRestId == null) {
            throw UnsupportedOperationException("A Rest must be selected")
        }
        var rest = restService.findById(requireNotNull(selectedRestId)).orElseThrow()
        if (restType != null) {
            rest = rest.copy(restType = requireNotNull(restType))
        }
        restType = null
        if (metadata != null) {
            rest = rest.copy(metadata = requireNotNull(metadata))
        }
        metadata = null

        restService.save(rest)
        return this
    }

    /**
     * Selects a [Rest].
     * @param index the position of the [Rest] inside its parent [Grouping].
     * @return the same [RestBuilder] instance that called this function.
     * @throws NoSuchElementException if there was no [Rest] found for the given [index].
     * @see appendAndSelectRest
     */
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

    /**
     * Creates, appends and selects a [Rest].
     * @param newRest the instance from where data will be copied to the new [Rest]. Its ID is ignored.
     * @return the same [RestBuilder] instance that called this function.
     * @see selectRest
     */
    fun appendAndSelectRest(newRest: Rest): RestBuilder {
        var rest = restService.appendToGrouping(requireNotNull(groupingBuilder.selectedGroupingId), newRest)
        rest = restService.save(rest)
        selectedRestId = rest.restId
        return this
    }

    /**
     * Deletes the selected [Rest].
     * @return the same [RestBuilder] instance that called this function.
     * @throws UnsupportedOperationException if no [Rest] was selected.
     * @see RestService.deleteById
     */
    fun deleteSelectedRest(): RestBuilder {
        if (selectedRestId == null) {
            throw UnsupportedOperationException("A Rest must be selected")
        }
        restService.deleteById(requireNotNull(selectedRestId))
        return this
    }

    /**
     * @return the instance of [GroupingBuilder] that created this [RestBuilder].
     */
    fun back(): GroupingBuilder {
        return groupingBuilder
    }
}