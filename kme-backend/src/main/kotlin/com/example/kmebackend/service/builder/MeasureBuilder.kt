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

    /**
     * Stores newKeySignature that will be used to override the selected Measure's keySignature.
     * @param newKeySignature the data that will be used to override the selected Measure's keySignature.
     * @return the same MeasureBuilder instance that called this function
     * @see save
     */
    fun setKeySignature(newKeySignature: KeySignature): MeasureBuilder {
        keySignature = newKeySignature
        return this
    }

    /**
     * Stores newTimeSignature that will be used to override the selected Measure's timeSignature.
     * @param newTimeSignature the data that will be used to override the selected Measure's timeSignature.
     * @return the same MeasureBuilder instance that called this function
     * @see save
     */
    fun setTimeSignature(newTimeSignature: TimeSignature): MeasureBuilder {
        timeSignature = newTimeSignature
        return this
    }

    /**
     * Stores newClef that will be used to override the selected Measure's clef.
     * @param newClef the data that will be used to override the selected Measure's clef.
     * @return the same MeasureBuilder instance that called this function
     * @see save
     */
    fun setClef(newClef: Clef): MeasureBuilder {
        clef = newClef
        return this
    }

    /**
     * Stores newMetadata that will be used to override the selected Measure's metadata.
     * @param newMetadata the data that will be used to override the selected Measure's metadata.
     * @return the same MeasureBuilder instance that called this function
     * @see save
     */
    fun setMetadata(newMetadata: String?): MeasureBuilder {
        metadata = newMetadata
        overrideMetadata = true
        return this
    }

    /**
     * @return the selected Measure's ID.
     * @throws UnsupportedOperationException if no Measure was selected.
     */
    fun getSelectedMeasureId(): MeasureId {
        if (selectedMeasureId == null) {
            throw UnsupportedOperationException("A Measure must be selected")
        }
        return requireNotNull(selectedMeasureId)
    }

    /**
     * Overrides the data that has been set for the selected Measure and then saves it.
     * The data that has been set is then discarded.
     * @return the same MeasureBuilder instance that called this function
     * @throws UnsupportedOperationException if no Measure was selected.
     */
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

    /**
     * Selects a Measure.
     * @param index the position of the Measure inside its parent Staff.
     * @return the same MeasureBuilder instance that called this function
     * @throws NoSuchElementException if there was no Measure found for the given index
     * @see appendAndSelectMeasure
     */
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

    /**
     * Creates, appends and selects a Measure.
     * @param newMeasure the instance from where data will be copied to the new Measure. Its ID is ignored.
     * @return the same MeasureBuilder instance that called this function.
     * @see selectMeasure
     */
    fun appendAndSelectMeasure(newMeasure: Measure): MeasureBuilder {
        var measure = measureService.appendToStaff(requireNotNull(staffBuilder.selectedStaffId), newMeasure)
        measure = measureService.save(measure)
        selectedMeasureId = measure.measureId
        return this
    }

    /**
     * Deletes the selected Measure.
     * @return the same MeasureBuilder instance that called this function.
     * @throws UnsupportedOperationException if no Measure was selected.
     * @see MeasureService.deleteById
     */
    fun deleteSelectedMeasure(): MeasureBuilder {
        if (selectedMeasureId == null) {
            throw UnsupportedOperationException("A Measure must be selected")
        }
        measureService.deleteById(requireNotNull(selectedMeasureId))
        return this
    }

    /**
     * @return a new VoiceBuilder that builds inside the selected Measure.
     * @throws UnsupportedOperationException if no Measure was selected.
     */
    fun buildVoices(): VoiceBuilder {
        if (selectedMeasureId == null) {
            throw UnsupportedOperationException("A Measure must be selected")
        }
        return VoiceBuilder(
            this,
            voiceService,
            groupingService,
            restService,
            chordService,
            noteService,
        )
    }

    /**
     * @return the instance of StaffBuilder that created this MeasureBuilder.
     */
    fun back(): StaffBuilder {
        return staffBuilder
    }
}
