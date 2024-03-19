package com.example.kmebackend.service.builder

import com.example.kmebackend.model.Staff
import com.example.kmebackend.model.StaffId
import com.example.kmebackend.service.*

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
    private var metadata: String? = null
    private var overrideMetadata: Boolean = false

    /**
     * Stores newMetadata that will be used to override the selected Staff's metadata.
     * @param newMetadata the data that will be used to override the selected Staff's metadata.
     * @return the same StaffBuilder instance that called this function
     * @see save
     */
    fun setMetadata(newMetadata: String?): StaffBuilder {
        metadata = newMetadata
        overrideMetadata = true
        return this
    }

    /**
     * Overrides the data that has been set for the selected Staff and then saves it.
     * The data that has been set is then discarded.
     * @return the same StaffBuilder instance that called this function
     * @throws UnsupportedOperationException if no Staff was selected.
     */
    fun save(): StaffBuilder {
        if (selectedStaffId == null) {
            throw UnsupportedOperationException("A Staff must be selected")
        }
        var staff = staffService.findById(requireNotNull(selectedStaffId)).orElseThrow()
        if (overrideMetadata) {
            staff = staff.copy(metadata = metadata)
        }
        overrideMetadata = false
        staffService.save(staff)
        return this
    }

    /**
     * Selects a Staff.
     * @param index the position of the Staff inside its parent StaffSystem.
     * @return the same StaffBuilder instance that called this function
     * @throws NoSuchElementException if there was no Staff found for the given index
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
     * Creates, appends and selects a Staff.
     * @param newStaff the instance from where data will be copied to the new Staff. Its ID is ignored.
     * @return the same StaffBuilder instance that called this function.
     * @see selectStaff
     */
    fun appendAndSelectStaff(newStaff: Staff): StaffBuilder {
        var staff = staffService.appendToStaffSystem(requireNotNull(staffSystemBuilder.selectedStaffSystemId), newStaff)
        staff = staffService.save(staff)
        selectedStaffId = staff.staffId
        return this
    }

    /**
     * @return a new MeasureBuilder that builds inside the selected Staff.
     * @throws UnsupportedOperationException if no Staff was selected.
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
