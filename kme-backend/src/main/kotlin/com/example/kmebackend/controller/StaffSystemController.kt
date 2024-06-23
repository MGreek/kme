package com.example.kmebackend.controller

import com.example.kmebackend.model.*
import com.example.kmebackend.model.dto.StaffSystemDTO
import com.example.kmebackend.service.*
import com.example.kmebackend.service.builder.StaffSystemBuilder
import com.example.kmebackend.service.converter.StaffSystemConverter
import jakarta.transaction.Transactional
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping

@Controller
@RequestMapping("/api/staff-system")
@CrossOrigin(origins = ["http://localhost:1234"])
class StaffSystemController(
    @Autowired
    val staffSystemService: StaffSystemService,
    @Autowired
    val staffService: StaffService,
    @Autowired
    val measureService: MeasureService,
    @Autowired
    val voiceService: VoiceService,
    @Autowired
    val groupingService: GroupingService,
    @Autowired
    val restService: RestService,
    @Autowired
    val chordService: ChordService,
    @Autowired
    val noteService: NoteService,
    @Autowired
    val staffSystemConverter: StaffSystemConverter,
) {
    // HACK: all operations are transactional so there's no need to worry
    // about the database
    @RequestMapping("/{id}")
    @Transactional
    fun getStaffSystemById(
        @PathVariable("id") id: String,
    ): ResponseEntity<StaffSystemDTO> {
        try {
            val staffSystem = staffSystemService.findById(StaffSystemId(id))
            if (staffSystem.isEmpty) {
                return ResponseEntity.notFound().build()
            }
            return ResponseEntity.ok(staffSystemConverter.staffSystemToDto(staffSystem.orElseThrow()))
        } catch (_: Exception) {
            return ResponseEntity.internalServerError().build()
        }
    }

    @PostMapping("/set")
    @Transactional
    fun setStaffSystemById(
        @RequestBody staffSystemDTO: StaffSystemDTO,
    ): ResponseEntity<Void> {
        try {
            staffSystemService.saveDTO(staffSystemDTO)
            return ResponseEntity.ok().build()
        } catch (_: Exception) {
            return ResponseEntity.internalServerError().build()
        }
    }

    @DeleteMapping("/delete/{id}")
    @Transactional
    fun deleteStaffSystemById(
        @PathVariable("id") id: String,
    ): ResponseEntity<Void> {
        try {
            staffSystemService.deleteById(StaffSystemId(staffSystemId = id))
            return ResponseEntity.ok().build()
        } catch (ex: Exception) {
            return ResponseEntity.internalServerError().build()
        }
    }

    @RequestMapping("/all")
    @Transactional
    fun findAllStaffSystems(): ResponseEntity<List<StaffSystemDTO>> {
        return try {
            ResponseEntity.ok(staffSystemService.findAll().map(staffSystemConverter::staffSystemToDto).toList())
        } catch (_: Exception) {
            ResponseEntity.internalServerError().build()
        }
    }

    @RequestMapping("/sample")
    @Transactional
    fun getSampleStaffSystem(): ResponseEntity<StaffSystemDTO> {
        try {
            val staffSystemBuilder =
                StaffSystemBuilder(
                    staffSystemService,
                    staffService,
                    measureService,
                    voiceService,
                    groupingService,
                    restService,
                    chordService,
                    noteService,
                )

            staffSystemBuilder.createAndSelectStaffSystem(
                StaffSystem(
                    metadataJson =
                        """
                        {"connectorType":"Brace"}
                        """,
                ),
            )
                .buildStaves()
                .appendAndSelectStaff(Staff())
                .buildMeasures()
                .appendAndSelectMeasure(
                    Measure(
                        keySignature = KeySignature.Flat2,
                        timeSignature = TimeSignature.FourFour,
                        clef = Clef.Bass,
                        metadataJson =
                            """
                            {"drawClef":true,"drawKeySignature":true,"drawTimeSignature":true}
                            """,
                    ),
                )
                .buildVoices()
                .appendAndSelectVoice(Voice())
                .buildGroupings()
                .appendAndSelectGrouping(Grouping())
                .buildChords()
                .appendAndSelectChord(
                    Chord(
                        stem = Stem(stemType = StemType.Quarter),
                        dotCount = 0,
                    ),
                )
                .buildNotes()
                .insertAndSelectNote(
                    Note(
                        noteId = NoteId(position = 8),
                        accidental = Accidental.None,
                    ),
                )
                .back()
                .appendAndSelectChord(
                    Chord(
                        stem = Stem(stemType = StemType.Quarter),
                        dotCount = 0,
                    ),
                )
                .buildNotes()
                .insertAndSelectNote(
                    Note(
                        noteId = NoteId(position = 0),
                        accidental = Accidental.None,
                    ),
                )
                .back()
                .appendAndSelectChord(
                    Chord(
                        stem = Stem(stemType = StemType.Quarter),
                        dotCount = 0,
                    ),
                )
                .buildNotes()
                .insertAndSelectNote(
                    Note(
                        noteId = NoteId(position = 0),
                        accidental = Accidental.None,
                    ),
                )
                .back()
                .appendAndSelectChord(
                    Chord(
                        stem = Stem(stemType = StemType.Quarter),
                        dotCount = 0,
                    ),
                )
                .buildNotes()
                .insertAndSelectNote(
                    Note(
                        noteId = NoteId(position = 0),
                        accidental = Accidental.None,
                    ),
                )
                .back().back().back()
                .appendAndSelectVoice(Voice())
                .buildGroupings()
                .appendAndSelectGrouping(Grouping())
                .buildChords()
                .appendAndSelectChord(Chord(stem = Stem(StemType.Whole), dotCount = 0))
                .buildNotes()
                .insertAndSelectNote(
                    Note(
                        noteId = NoteId(position = 0),
                        accidental = Accidental.None,
                    ),
                )
                .back().back().back().back()
                .appendAndSelectMeasure(
                    Measure(
                        keySignature = KeySignature.Flat2,
                        timeSignature = TimeSignature.FourFour,
                        clef = Clef.Treble,
                    ),
                )
                .buildVoices()
                .appendAndSelectVoice(Voice())
                .buildGroupings()
                .appendAndSelectGrouping(Grouping())
                .buildRests()
                .appendAndSelectRest(Rest(position = 0, restType = RestType.Whole))
                .back().back().back().back().back()
                .buildStaves()
                .appendAndSelectStaff(Staff())
                .buildMeasures()
                .appendAndSelectMeasure(
                    Measure(
                        keySignature = KeySignature.Flat2,
                        timeSignature = TimeSignature.FourFour,
                        clef = Clef.Treble,
                        metadataJson =
                            """
                            {"drawClef":true,"drawKeySignature":true,"drawTimeSignature":true}
                            """,
                    ),
                )
                .buildVoices()
                .appendAndSelectVoice(Voice())
                .buildGroupings()
                .appendAndSelectGrouping(Grouping())
                .buildChords()
                .appendAndSelectChord(
                    Chord(
                        stem = Stem(stemType = StemType.Quarter),
                        dotCount = 0,
                    ),
                )
                .buildNotes()
                .insertAndSelectNote(
                    Note(
                        noteId = NoteId(position = 0),
                        accidental = Accidental.None,
                    ),
                )
                .back()
                .appendAndSelectChord(
                    Chord(
                        stem = Stem(stemType = StemType.Quarter),
                        dotCount = 0,
                    ),
                )
                .buildNotes()
                .insertAndSelectNote(
                    Note(
                        noteId = NoteId(position = 0),
                        accidental = Accidental.None,
                    ),
                )
                .back()
                .appendAndSelectChord(
                    Chord(
                        stem = Stem(stemType = StemType.Quarter),
                        dotCount = 0,
                    ),
                )
                .buildNotes()
                .insertAndSelectNote(
                    Note(
                        noteId = NoteId(position = 0),
                        accidental = Accidental.None,
                    ),
                )
                .back()
                .appendAndSelectChord(
                    Chord(
                        stem = Stem(stemType = StemType.Sixteenth),
                        dotCount = 0,
                    ),
                )
                .buildNotes()
                .insertAndSelectNote(
                    Note(
                        noteId = NoteId(position = 0),
                        accidental = Accidental.DoubleSharp,
                    ),
                )
                .back().back()
                .buildRests()
                .appendAndSelectRest(Rest(position = 0, restType = RestType.Sixteenth))
                .back()
                .buildChords()
                .appendAndSelectChord(
                    Chord(
                        stem = Stem(stemType = StemType.Eight),
                        dotCount = 0,
                    ),
                )
                .buildNotes()
                .insertAndSelectNote(
                    Note(
                        noteId = NoteId(position = 0),
                        accidental = Accidental.DoubleSharp,
                    ),
                )
                .back().back().back()
                .appendAndSelectVoice(Voice())
                .buildGroupings()
                .appendAndSelectGrouping(Grouping())
                .buildChords()
                .appendAndSelectChord(Chord(stem = Stem(StemType.Whole), dotCount = 0))
                .buildNotes()
                .insertAndSelectNote(
                    Note(
                        noteId = NoteId(position = 0),
                        accidental = Accidental.None,
                    ),
                )
                .back().back().back().back()
                .appendAndSelectMeasure(
                    Measure(
                        keySignature = KeySignature.Flat2,
                        timeSignature = TimeSignature.FourFour,
                        clef = Clef.Treble,
                    ),
                )
                .buildVoices()
                .appendAndSelectVoice(Voice())
                .buildGroupings()
                .appendAndSelectGrouping(Grouping())
                .buildRests()
                .appendAndSelectRest(Rest(position = 0, restType = RestType.Half))
                .appendAndSelectRest(Rest(position = 0, restType = RestType.Half))

            staffSystemBuilder.buildStaves().selectStaff(0).buildMeasures()
                .appendAndSelectMeasure(
                    Measure(
                        keySignature = KeySignature.Flat2,
                        timeSignature = TimeSignature.FourFour,
                        clef = Clef.Treble,
                        metadataJson =
                            """
                            {"drawClef":true,"drawKeySignature":true,"drawTimeSignature":true}
                            """,
                    ),
                )
                .buildVoices()
                .appendAndSelectVoice(Voice())
                .buildGroupings()
                .appendAndSelectGrouping(Grouping())
                .buildRests()
                .appendAndSelectRest(Rest(position = 0, restType = RestType.Half))
                .appendAndSelectRest(Rest(position = 0, restType = RestType.Half))

            staffSystemBuilder.buildStaves().selectStaff(1).buildMeasures()
                .appendAndSelectMeasure(
                    Measure(
                        keySignature = KeySignature.Flat2,
                        timeSignature = TimeSignature.FourFour,
                        clef = Clef.Treble,
                        metadataJson =
                            """
                            {"drawClef":true,"drawKeySignature":true,"drawTimeSignature":true}
                            """,
                    ),
                )
                .buildVoices()
                .appendAndSelectVoice(Voice())
                .buildGroupings()
                .appendAndSelectGrouping(Grouping())
                .buildRests()
                .appendAndSelectRest(Rest(position = 0, restType = RestType.Half))
                .appendAndSelectRest(Rest(position = 0, restType = RestType.Half))

            staffSystemBuilder.buildStaves().selectStaff(0)
                .buildMeasures()
                .appendAndSelectMeasure(
                    Measure(
                        keySignature = KeySignature.Flat2,
                        timeSignature = TimeSignature.FourFour,
                        clef = Clef.Treble,
                    ),
                )
                .buildVoices()
                .appendAndSelectVoice(Voice())
                .buildGroupings()
                .appendAndSelectGrouping(Grouping())
                .buildRests()
                .appendAndSelectRest(Rest(position = 0, restType = RestType.Half))
                .appendAndSelectRest(Rest(position = 0, restType = RestType.Half))

            staffSystemBuilder.buildStaves().selectStaff(1)
                .buildMeasures()
                .appendAndSelectMeasure(
                    Measure(
                        keySignature = KeySignature.Flat2,
                        timeSignature = TimeSignature.FourFour,
                        clef = Clef.Treble,
                    ),
                )
                .buildVoices()
                .appendAndSelectVoice(Voice())
                .buildGroupings()
                .appendAndSelectGrouping(Grouping())
                .buildRests()
                .appendAndSelectRest(Rest(position = 0, restType = RestType.Half))
                .appendAndSelectRest(Rest(position = 0, restType = RestType.Half))

            val staffSystem = staffSystemService.findById(staffSystemBuilder.getSelectedStaffSystemId()).orElseThrow()
            return ResponseEntity.ok(staffSystemConverter.staffSystemToDto(staffSystem))
        } catch (_: Exception) {
            return ResponseEntity.internalServerError().build()
        }
    }
}