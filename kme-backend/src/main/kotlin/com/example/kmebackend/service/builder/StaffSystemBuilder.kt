package com.example.kmebackend.service.builder

import com.example.kmebackend.model.StaffSystem
import com.example.kmebackend.model.StaffSystemId
import com.example.kmebackend.service.*

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

    private var metadata: String? = null
    private var overrideMetadata: Boolean = false

    fun setMetadata(newMetadata: String?): StaffSystemBuilder {
        metadata = newMetadata
        overrideMetadata = true
        return this
    }

    fun save(): StaffSystemBuilder {
        // TODO: reset overrideMetadata to false when done; do this for other builders also
        if (selectedStaffSystemId == null) {
            throw UnsupportedOperationException("A StaffSystem must be selected")
        }
        var staffSystem = staffSystemService.findById(requireNotNull(selectedStaffSystemId)).orElseThrow()
        if (overrideMetadata) {
            staffSystem = staffSystem.copy(metadata = metadata)
        }
        staffSystemService.save(staffSystem)
        return this
    }

    fun selectStaffSystem(uuid: String): StaffSystemBuilder {
        val staffSystemId = StaffSystemId(staffSystemId = uuid)
        if (!staffSystemService.existsById(staffSystemId)) {
            throw NoSuchElementException("StaffSystem with ID $staffSystemId not found")
        }
        selectedStaffSystemId = staffSystemId
        return this
    }

    fun createAndSelectStaffSystem(newStaffSystem: StaffSystem): StaffSystemBuilder {
        var staffSystem = staffSystemService.createStaffSystem(newStaffSystem)
        staffSystem = staffSystemService.save(staffSystem)
        selectedStaffSystemId = staffSystem.staffSystemId
        return this
    }

    fun buildStaves(): StaffBuilder {
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
