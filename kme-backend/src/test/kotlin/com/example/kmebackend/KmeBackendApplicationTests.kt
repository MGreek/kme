package com.example.kmebackend

import com.example.kmebackend.model.*
import com.example.kmebackend.service.*
import com.example.kmebackend.service.builder.StaffSystemBuilder
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest
class KmeBackendApplicationTests(
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
) {
    @Test
    fun contextLoads() {
    }

    @Test
    fun storeSheetMusic() {
        // TODO: documentation for builder classes; documentation for tests
        val builder =
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
        builder.createAndSelectStaffSystem(StaffSystem())
            .buildStaves()
            .appendAndSelectStaff(Staff()) // Treble
            .buildMeasures()
            .appendAndSelectMeasure(
                Measure(
                    keySignature = KeySignature.Sharp4,
                    timeSignature = TimeSignature.Common,
                    clef = Clef.Treble,
                ),
            )
            .buildVoices()
            .appendAndSelectVoice(Voice()) // Voice 1
            .buildGroupings()
            .appendAndSelectGrouping(Grouping())
            .buildRests()
            .appendAndSelectRest(Rest(restType = RestType.Whole))
            .back().back()
            .appendAndSelectVoice(Voice()) // Voice 2
            .buildGroupings()
            .appendAndSelectGrouping(Grouping())
            .buildRests()
            .appendAndSelectRest(Rest(restType = RestType.Half))
            .back()
            .buildChords()
            .appendAndSelectChord(Chord(stem = Stem(stemType = StemType.Half), dotCount = 0))
            .buildNotes()
            .insertAndSelectNote(Note(noteId = NoteId(position = 4), accidental = Accidental.None))
            .back().back().back()
            .appendAndSelectVoice(Voice()) // Voice 3
            .buildGroupings()
            .appendAndSelectGrouping(Grouping())
            .buildChords()
            .appendAndSelectChord(Chord(stem = Stem(stemType = StemType.Half), dotCount = 0))
            .buildNotes()
            .insertAndSelectNote(Note(noteId = NoteId(position = 0), accidental = Accidental.None))
            .back()
            .appendAndSelectChord(Chord(stem = Stem(stemType = StemType.Half), dotCount = 0))
            .buildNotes()
            .insertAndSelectNote(Note(noteId = NoteId(position = -1), accidental = Accidental.None))
            .back().back().back().back().back()
            .appendAndSelectStaff(Staff()) // Bass
            .buildMeasures()
            .appendAndSelectMeasure(
                Measure(
                    keySignature = KeySignature.Sharp4,
                    timeSignature = TimeSignature.Common,
                    clef = Clef.Bass,
                ),
            )
            .buildVoices()
            .appendAndSelectVoice(Voice()) // Voice 1
            .buildGroupings()
            .appendAndSelectGrouping(Grouping())
            .buildChords()
            .appendAndSelectChord(Chord(stem = Stem(stemType = StemType.Half), dotCount = 1))
            .buildNotes()
            .insertAndSelectNote(Note(noteId = NoteId(position = -6), accidental = Accidental.None))
            .back()
            .appendAndSelectChord(Chord(stem = Stem(stemType = StemType.Quarter), dotCount = 0))
            .buildNotes()
            .insertAndSelectNote(Note(noteId = NoteId(position = -6), accidental = Accidental.Natural))
            .back().back().back()
            .appendAndSelectVoice(Voice()) // Voice 2
            .buildGroupings()
            .appendAndSelectGrouping(Grouping())
            .buildChords()
            .appendAndSelectChord(Chord(stem = Stem(stemType = StemType.Quarter), dotCount = 0))
            .buildNotes()
            .insertAndSelectNote(Note(noteId = NoteId(position = -10), accidental = Accidental.None))
            .back()
            .appendAndSelectChord(Chord(stem = Stem(stemType = StemType.Quarter), dotCount = 0))
            .buildNotes()
            .insertAndSelectNote(Note(noteId = NoteId(position = -9), accidental = Accidental.None))
            .back()
            .appendAndSelectChord(Chord(stem = Stem(stemType = StemType.Half), dotCount = 0))
            .buildNotes()
            .insertAndSelectNote(Note(noteId = NoteId(position = -8), accidental = Accidental.None))
    }

/*
    @Test
    fun storeSheetMusic() {
        val staffSystem =
            StaffSystem(
                StaffSystemId(),
            )
        staffSystemService.save(staffSystem)

        // TODO: use Builder pattern to make code more concise
        createTrebleStaff(staffSystem)
        createBassStaff(staffSystem)
    }

    private fun createBassStaff(staffSystem: StaffSystem) {
        val bass = staffService.appendToStaffSystem(requireNotNull(staffSystem.staffSystemId), Staff())
        staffService.save(bass)

        val measure =
            measureService.appendToStaff(
                requireNotNull(bass.staffId),
                Measure(
                    keySignature = KeySignature.Sharp4,
                    timeSignature = TimeSignature.Common,
                    clef = Clef.Bass,
                ),
            )
        measureService.save(measure)

        val voice1 = voiceService.appendToMeasure(requireNotNull(measure.measureId), Voice())
        voiceService.save(voice1)

        val voice1Grouping = groupingService.appendToVoice(requireNotNull(voice1.voiceId), Grouping())
        groupingService.save(voice1Grouping)

        val voice1Chord1 =
            chordService.appendToGrouping(
                requireNotNull(voice1Grouping.groupingId),
                Chord(stem = Stem(stemType = StemType.Quarter)),
            )
        chordService.save(voice1Chord1)

        val voice1Chord1Note =
            noteService.insertInChord(
                requireNotNull(voice1Chord1.chordId),
                Note(
                    noteId = NoteId(position = -10),
                    accidental = Accidental.None,
                    dotCount = 0,
                ),
            )
        noteService.save(voice1Chord1Note)

        val voice1Chord2 =
            chordService.appendToGrouping(
                requireNotNull(voice1Grouping.groupingId),
                Chord(stem = Stem(stemType = StemType.Quarter)),
            )
        chordService.save(voice1Chord2)

        val voice1Chord2Note =
            noteService.insertInChord(
                requireNotNull(voice1Chord2.chordId),
                Note(
                    noteId = NoteId(position = -9),
                    accidental = Accidental.None,
                    dotCount = 0,
                ),
            )
        noteService.save(voice1Chord2Note)

        val voice1Chord3 =
            chordService.appendToGrouping(
                requireNotNull(voice1Grouping.groupingId),
                Chord(stem = Stem(stemType = StemType.Half)),
            )
        chordService.save(voice1Chord3)

        val voice1Chord3Note =
            noteService.insertInChord(
                requireNotNull(voice1Chord3.chordId),
                Note(
                    noteId = NoteId(position = -8),
                    accidental = Accidental.None,
                    dotCount = 0,
                ),
            )
        noteService.save(voice1Chord3Note)
    }

    private fun createTrebleStaff(staffSystem: StaffSystem) {
        val treble = staffService.appendToStaffSystem(requireNotNull(staffSystem.staffSystemId), Staff())
        staffService.save(treble)

        val measure =
            measureService.appendToStaff(
                requireNotNull(treble.staffId),
                Measure(
                    keySignature = KeySignature.Sharp4,
                    timeSignature = TimeSignature.Common,
                    clef = Clef.Treble,
                ),
            )
        measureService.save(measure)

        val voice1 = voiceService.appendToMeasure(requireNotNull(measure.measureId), Voice())
        voiceService.save(voice1)

        val voice1Grouping = groupingService.appendToVoice(requireNotNull(voice1.voiceId), Grouping())
        groupingService.save(voice1Grouping)

        val voice1Chord1 =
            chordService.appendToGrouping(
                requireNotNull(voice1Grouping.groupingId),
                Chord(stem = Stem(stemType = StemType.Half)),
            )
        chordService.save(voice1Chord1)

        val voice1Chord1Note =
            noteService.insertInChord(
                requireNotNull(voice1Chord1.chordId),
                Note(
                    noteId = NoteId(position = 0),
                    accidental = Accidental.None,
                    dotCount = 0,
                ),
            )
        noteService.save(voice1Chord1Note)

        val voice1Chord2 =
            chordService.appendToGrouping(
                requireNotNull(voice1Grouping.groupingId),
                Chord(stem = Stem(stemType = StemType.Half)),
            )
        chordService.save(voice1Chord2)

        val voice1Chord2Note =
            noteService.insertInChord(
                requireNotNull(voice1Chord2.chordId),
                Note(
                    noteId = NoteId(position = -1),
                    accidental = Accidental.None,
                    dotCount = 0,
                ),
            )
        noteService.save(voice1Chord2Note)
    }
*/
}
