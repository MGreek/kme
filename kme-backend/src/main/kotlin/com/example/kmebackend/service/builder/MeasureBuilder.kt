package com.example.kmebackend.service.builder

import com.example.kmebackend.model.*
import com.example.kmebackend.service.*

class MeasureBuilder internal constructor(
    private val staffBuilder: StaffBuilder,
    private val measureService: MeasureService,
    private val voiceService: VoiceService,
    private val groupingService: GroupingService,
    private val restService: RestService,
    private val chordService: ChordService,
    private val noteService: NoteService,
) {
    internal var selectedMeasureId: MeasureId? = null

    private var keySignature: KeySignature? = null
    private var timeSignature: TimeSignature? = null
    private var clef: Clef? = null
    private var metadata: String? = null
    private var overrideMetadata: Boolean = false

    fun setKeySignature(newKeySignature: KeySignature): MeasureBuilder {
        keySignature = newKeySignature
        return this
    }

    fun setTimeSignature(newTimeSignature: TimeSignature): MeasureBuilder {
        timeSignature = newTimeSignature
        return this
    }

    fun setClef(newClef: Clef): MeasureBuilder {
        clef = newClef
        return this
    }

    fun setMetadata(newMetadata: String?): MeasureBuilder {
        metadata = newMetadata
        overrideMetadata = true
        return this
    }

    fun save(): MeasureBuilder {
        if (selectedMeasureId == null) {
            throw UnsupportedOperationException("A Measure must be selected")
        }
        var measure = measureService.findById(requireNotNull(selectedMeasureId)).orElseThrow()
        if (keySignature != null) {
            measure = measure.copy(keySignature = requireNotNull(keySignature))
        }
        keySignature = null
        if (timeSignature != null) {
            measure = measure.copy(timeSignature = requireNotNull(timeSignature))
        }
        timeSignature = null
        if (clef != null) {
            measure = measure.copy(clef = requireNotNull(clef))
        }
        clef = null
        if (overrideMetadata) {
            measure = measure.copy(metadata = metadata)
        }
        overrideMetadata = false

        measureService.save(measure)
        return this
    }

    fun selectMeasure(index: Int): MeasureBuilder {
        val measureId =
            MeasureId(
                staffId = requireNotNull(staffBuilder.selectedStaffId),
                measuresOrder = index,
            )
        if (!measureService.existsById(measureId)) {
            throw NoSuchElementException("Staff with ID $measureId not found")
        }
        selectedMeasureId = measureId
        return this
    }

    fun appendAndSelectMeasure(newMeasure: Measure): MeasureBuilder {
        var measure = measureService.appendToStaff(requireNotNull(staffBuilder.selectedStaffId), newMeasure)
        measure = measureService.save(measure)
        selectedMeasureId = measure.measureId
        return this
    }

    fun buildVoices(): VoiceBuilder {
        return VoiceBuilder(
            this,
            voiceService,
            groupingService,
            restService,
            chordService,
            noteService,
        )
    }

    fun back(): StaffBuilder {
        return staffBuilder
    }
}
