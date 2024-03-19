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

    fun setMetadata(newMetadata: String?): StaffBuilder {
        metadata = newMetadata
        overrideMetadata = true
        return this
    }

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

    fun selectStaff(index: Int): StaffBuilder {
        val staffId = StaffId(requireNotNull(staffSystemBuilder.selectedStaffSystemId), index)
        if (!staffService.existsById(staffId)) {
            throw NoSuchElementException("Staff with ID $staffId not found")
        }
        selectedStaffId = staffId
        return this
    }

    fun appendAndSelectStaff(newStaff: Staff): StaffBuilder {
        var staff = staffService.appendToStaffSystem(requireNotNull(staffSystemBuilder.selectedStaffSystemId), newStaff)
        staff = staffService.save(staff)
        selectedStaffId = staff.staffId
        return this
    }

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

    fun back(): StaffSystemBuilder {
        return staffSystemBuilder
    }
}
