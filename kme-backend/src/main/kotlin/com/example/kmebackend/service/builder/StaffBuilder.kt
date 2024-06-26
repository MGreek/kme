package com.example.kmebackend.service.builder

import com.example.kmebackend.model.Staff
import com.example.kmebackend.model.StaffId
import com.example.kmebackend.model.StaffSystem
import com.example.kmebackend.service.*

/**
 * A class that makes building [Staves][Staff] easier and faster.
 */
class StaffBuilder internal constructor(
    private val staffSystemBuilder: StaffSystemBuilder,
    private val staffService: StaffService,
    private val measureService: MeasureService,
    private val voiceService: VoiceService,
    private val groupingService: GroupingService,
    private val restService: RestService,
    private val chordService: ChordService,
    private val noteService: NoteService,
) {
    internal var selectedStaffId: StaffId? = null
    private var metadataJson: String? = null

    /**
     * Stores [newMetadataJson] that will be used to override the selected [Staff's][Staff] [metadata][Staff.metadataJson].
     * @param newMetadataJson the data that will be used to override the selected [Staff's][Staff] [metadata][Staff.metadataJson].
     * @return the same [StaffBuilder] instance that called this function.
     * @see save
     */
    fun setMetadata(newMetadataJson: String?): StaffBuilder {
        metadataJson = newMetadataJson
        return this
    }

    /**
     * @return the selected [Staff's][Staff] ID.
     * @throws UnsupportedOperationException if no [Staff] was selected.
     */
    fun getSelectedStaffId(): StaffId {
        if (selectedStaffId == null) {
            throw UnsupportedOperationException("A Staff must be selected")
        }
        return requireNotNull(selectedStaffId)
    }

    /**
     * Overrides the data that has been set for the selected [Staff] and then saves it.
     * The data that has been set is then discarded.
     * @return the same [StaffBuilder] instance that called this function
     * @throws UnsupportedOperationException if no [Staff] was selected.
     */
    fun save(): StaffBuilder {
        if (selectedStaffId == null) {
            throw UnsupportedOperationException("A Staff must be selected")
        }
        var staff = staffService.findById(requireNotNull(selectedStaffId)).orElseThrow()
        if (metadataJson != null) {
            staff = staff.copy(metadataJson = requireNotNull(metadataJson))
        }
        metadataJson = null

        staffService.save(staff)
        return this
    }

    /**
     * Selects a [Staff].
     * @param index the position of the [Staff] inside its parent [StaffSystem][StaffSystem].
     * @return the same [StaffBuilder] instance that called this function
     * @throws NoSuchElementException if there was no [Staff] found for the given [index]
     * @see appendAndSelectStaff
     */
    fun selectStaff(index: Int): StaffBuilder {
        val staffId = StaffId(requireNotNull(staffSystemBuilder.selectedStaffSystemId), index)
        if (!staffService.existsById(staffId)) {
            throw NoSuchElementException("Staff with ID $staffId not found")
        }
        selectedStaffId = staffId
        return this
    }

    /**
     * Creates, appends and selects a [Staff].
     * @param newStaff the instance from where data will be copied to the new [Staff]. Its ID is ignored.
     * @return the same [StaffBuilder] instance that called this function.
     * @see selectStaff
     */
    fun appendAndSelectStaff(newStaff: Staff): StaffBuilder {
        var staff = staffService.appendToStaffSystem(requireNotNull(staffSystemBuilder.selectedStaffSystemId), newStaff)
        staff = staffService.save(staff)
        selectedStaffId = staff.staffId
        return this
    }

    /**
     * Deletes the selected [Staff].
     * @return the same [StaffBuilder] instance that called this function.
     * @throws UnsupportedOperationException if no [Staff] was selected.
     * @see StaffService.deleteById
     */
    fun deleteSelectedStaff(): StaffBuilder {
        if (selectedStaffId == null) {
            throw UnsupportedOperationException("A Staff must be selected")
        }
        staffService.deleteById(requireNotNull(selectedStaffId))
        return this
    }

    /**
     * @return a new [MeasureBuilder] that builds inside the selected [Staff].
     * @throws UnsupportedOperationException if no [Staff] was selected.
     */
    fun buildMeasures(): MeasureBuilder {
        if (selectedStaffId == null) {
            throw UnsupportedOperationException("A Staff must be selected")
        }
        return MeasureBuilder(
            this,
            measureService,
            voiceService,
            groupingService,
            restService,
            chordService,
            noteService,
        )
    }

    /**
     * @return the instance of StaffSystemBuilder that created this StaffBuilder.
     */
    fun back(): StaffSystemBuilder {
        return staffSystemBuilder
    }
}