package com.example.kmebackend.service.builder

import com.example.kmebackend.model.StaffSystem
import com.example.kmebackend.model.StaffSystemId
import com.example.kmebackend.service.*

/**
 * A class that makes building [StaffSystems][StaffSystem] easier and faster.
 */
class StaffSystemBuilder(
    private val staffSystemService: StaffSystemService,
    private val staffService: StaffService,
    private val measureService: MeasureService,
    private val voiceService: VoiceService,
    private val groupingService: GroupingService,
    private val restService: RestService,
    private val chordService: ChordService,
    private val noteService: NoteService,
) {
    internal var selectedStaffSystemId: StaffSystemId? = null

    private var metadataJson: String? = null

    /**
     * Stores [newMetadataJson] that will be used to override the selected [StaffSystem's][StaffSystem] [metadata][StaffSystem.metadataJson].
     * @param newMetadataJson the data that will be used to override the selected [StaffSystem]'s [metadata][StaffSystem.metadataJson].
     * @return the same [StaffSystemBuilder] instance that called this function
     * @see save
     */
    fun setMetadata(newMetadataJson: String?): StaffSystemBuilder {
        metadataJson = newMetadataJson
        return this
    }

    /**
     * @return the selected [StaffSystem's][StaffSystem] ID.
     * @throws UnsupportedOperationException if no [StaffSystem] was selected.
     */
    fun getSelectedStaffSystemId(): StaffSystemId {
        if (selectedStaffSystemId == null) {
            throw UnsupportedOperationException("A StaffSystem must be selected")
        }
        return requireNotNull(selectedStaffSystemId)
    }

    /**
     * Overrides the data that has been set for the selected [StaffSystem] and then saves it.
     * The data that has been set is then discarded.
     * @return the same [StaffSystemBuilder] instance that called this function
     * @throws UnsupportedOperationException if no [StaffSystem] was selected.
     */
    fun save(): StaffSystemBuilder {
        if (selectedStaffSystemId == null) {
            throw UnsupportedOperationException("A StaffSystem must be selected")
        }
        var staffSystem = staffSystemService.findById(requireNotNull(selectedStaffSystemId)).orElseThrow()
        if (metadataJson != null) {
            staffSystem = staffSystem.copy(metadataJson = requireNotNull(metadataJson))
        }
        metadataJson = null

        staffSystemService.save(staffSystem)
        return this
    }

    /**
     * Selects a [StaffSystem].
     * @param staffSystemId the ID of the [StaffSystem].
     * @return the same [StaffSystemBuilder] instance that called this function
     * @throws NoSuchElementException if there was no [StaffSystem] found for [staffSystemId]
     * @see createAndSelectStaffSystem
     */
    fun selectStaffSystem(staffSystemId: StaffSystemId): StaffSystemBuilder {
        if (!staffSystemService.existsById(staffSystemId)) {
            throw NoSuchElementException("StaffSystem with ID $staffSystemId not found")
        }
        selectedStaffSystemId = staffSystemId
        return this
    }

    /**
     * Creates and selects a [StaffSystem].
     * @param newStaffSystem the instance from where data will be copied to the new [StaffSystem]. Its ID is ignored.
     * @return the same [StaffSystemBuilder] instance that called this function.
     * @see selectStaffSystem
     */
    fun createAndSelectStaffSystem(newStaffSystem: StaffSystem): StaffSystemBuilder {
        var staffSystem = staffSystemService.createStaffSystem(newStaffSystem)
        staffSystem = staffSystemService.save(staffSystem)
        selectedStaffSystemId = staffSystem.staffSystemId
        return this
    }

    /**
     * Deletes the selected [StaffSystem].
     * @return the same [StaffSystemBuilder] instance that called this function.
     * @throws UnsupportedOperationException if no [StaffSystem] was selected.
     * @see StaffSystemService.deleteById
     */
    fun deleteSelectedStaffSystem(): StaffSystemBuilder {
        if (selectedStaffSystemId == null) {
            throw UnsupportedOperationException("A StaffSystem must be selected")
        }
        staffSystemService.deleteById(requireNotNull(selectedStaffSystemId))
        return this
    }

    /**
     * @return a new [StaffBuilder] that builds inside the selected [StaffSystem].
     * @throws UnsupportedOperationException if no [StaffSystem] was selected.
     */
    fun buildStaves(): StaffBuilder {
        if (selectedStaffSystemId == null) {
            throw UnsupportedOperationException("A StaffSystem must be selected")
        }
        return StaffBuilder(
            this,
            staffService,
            measureService,
            voiceService,
            groupingService,
            restService,
            chordService,
            noteService,
        )
    }
}